"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import socket from "@/lib/socket";
import { useGrupos } from "@/hooks/useGrupos";
import { Actuador } from "@/types/actuador";
import { toast } from "sonner";
import { Grupo } from "@/types/grupo";
import CrearGrupoModal from "@/components/grupos/CrearGrupoModal";

// Componentes nuevos
import FiltrosLora from "@/components/dashboard/FiltrosLora";
import VistaArbol from "@/components/dashboard/VistaArbol";
import VistaTarjetas from "@/components/dashboard/VistaTarjetas";
import CrearGrupoButton from "@/components/dashboard/CrearGrupoButton";
import ListaGrupos from "@/components/dashboard/ListaGrupos";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="text-center p-4">Cargando mapa...</div>,
});

const empresaId = "cb15184e-3633-4d74-9a49-85f3df111320";

export default function DashboardPage() {
  const [actuadores, setActuadores] = useState<Actuador[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: grupos } = useGrupos();

  // Filtros
  const [busquedaAlias, setBusquedaAlias] = useState("");
  const [estadoLora, setEstadoLora] = useState("");
  const [estadoGateway, setEstadoGateway] = useState("");
  const [motorEncendido, setMotorEncendido] = useState("");

  // Modo de vista
  const [modoArbol, setModoArbol] = useState(false);
  const [loraSeleccionado, setLoraSeleccionado] = useState<Actuador | null>(
    null
  );

  useEffect(() => {
    const fetchActuadores = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_WS_URL}/api/actuadores`
        );
        const data = await res.json();
        setActuadores(data);
      } catch (err) {
        console.error("Error al obtener actuadores:", err);
      }
    };
    fetchActuadores();
  }, []);

  useEffect(() => {
    socket.on("estado-actuadores", (data: Actuador[]) => {
      setActuadores((prev) => {
        const actualizados = prev.map((act) => {
          const nuevo = data.find((a) => a.id === act.id);
          return nuevo ? { ...act, ...nuevo } : act;
        });

        if (loraSeleccionado) {
          const actualizado = actualizados.find(
            (a) => a.id === loraSeleccionado.id
          );
          if (actualizado) setLoraSeleccionado(actualizado);
        }

        return actualizados;
      });
    });

    return () => {
      socket.off("estado-actuadores");
    };
  }, [loraSeleccionado]);

  const handleAccion = async (
    id: string,
    tipo: "encender" | "apagar" | "reiniciar"
  ) => {
    const alias = modoArbol
      ? loraSeleccionado?.alias ?? "Lora"
      : actuadores.find((a) => a.id === id)?.alias ?? "Lora";

    setLoadingId(id);
    try {
      const endpoint =
        tipo === "encender"
          ? "encender-motor"
          : tipo === "apagar"
          ? "apagar-motor"
          : "reiniciar-gateway";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_WS_URL}/api/actuadores/${id}/${endpoint}`,
        { method: "POST" }
      );

      const data = await res.json();
      const accion =
        tipo === "encender"
          ? "encendido"
          : tipo === "apagar"
          ? "apagado"
          : "reiniciado";

      if (res.ok) {
        toast.success(`✅ ${alias} ${accion} correctamente`);
      } else {
        toast.error(`❌ ${data?.message || `Error al ${accion} ${alias}`}`);
      }
    } catch (err) {
      toast.error(`❌ Error inesperado al procesar ${alias}`);
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const actuadoresFiltrados = actuadores
    .filter((act) => {
      const coincideAlias = act.alias
        .toLowerCase()
        .includes(busquedaAlias.toLowerCase());

      const coincideEstadoLora = estadoLora === "" || act.estado === estadoLora;
      const coincideEstadoGateway =
        estadoGateway === "" || act.estadoGateway === estadoGateway;
      const coincideMotor =
        motorEncendido === ""
          ? true
          : motorEncendido === "on"
          ? act.motorEncendido
          : !act.motorEncendido;

      return (
        coincideAlias &&
        coincideEstadoLora &&
        coincideEstadoGateway &&
        coincideMotor
      );
    })
    .sort((a, b) => a.alias.localeCompare(b.alias));

  return (
    <main className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/2 flex flex-col gap-4 overflow-y-auto max-h-screen pr-2">
          <h1 className="text-2xl font-bold">Loras disponibles</h1>

          {/* Toggle de modo de vista */}
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={modoArbol}
                onChange={() => setModoArbol(!modoArbol)}
                className="toggle toggle-sm"
              />
              Ver en modo árbol
            </label>
          </div>

          {/* Filtros o vista árbol */}
          {!modoArbol ? (
            <FiltrosLora
              busquedaAlias={busquedaAlias}
              setBusquedaAlias={setBusquedaAlias}
              estadoLora={estadoLora}
              setEstadoLora={setEstadoLora}
              estadoGateway={estadoGateway}
              setEstadoGateway={setEstadoGateway}
              motorEncendido={motorEncendido}
              setMotorEncendido={setMotorEncendido}
            />
          ) : (
            <VistaArbol
              actuadores={actuadores}
              loraSeleccionado={loraSeleccionado}
              setLoraSeleccionado={setLoraSeleccionado}
              busquedaAlias={busquedaAlias}
              setBusquedaAlias={setBusquedaAlias}
              handleAccion={handleAccion}
              loadingId={loadingId}
            />
          )}

          {!modoArbol && (
            <VistaTarjetas
              actuadores={actuadoresFiltrados}
              handleAccion={handleAccion}
              loadingId={loadingId}
            />
          )}

          <h2 className="text-xl font-semibold mt-4">Grupos creados</h2>

          <CrearGrupoButton onClick={() => setModalOpen(true)} />

          <CrearGrupoModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            empresaId={empresaId}
            loras={actuadores}
            gruposExistentes={grupos ?? []}
          />

          <ListaGrupos grupos={grupos ?? []} actuadores={actuadores} />
        </div>

        <div className="lg:w-1/2 w-full h-[300px] lg:h-auto">
          <MapView actuadores={actuadores} />
        </div>
      </div>
    </main>
  );
}
