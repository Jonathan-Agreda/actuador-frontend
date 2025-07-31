"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import socket from "@/lib/socket";
import LoraCard from "@/components/LoraCard";
import CrearGrupoModal from "@/components/grupos/CrearGrupoModal";
import GrupoCard from "@/components/grupos/GrupoCard";
import { useGrupos } from "@/hooks/useGrupos";
import { Actuador } from "@/types/actuador";
import { Grupo } from "@/types/grupo";
import { toast } from "sonner";

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
      setActuadores((prev) =>
        prev.map((act) => {
          const nuevo = data.find((a) => a.id === act.id);
          return nuevo ? { ...act, ...nuevo } : act;
        })
      );
    });
    return () => {
      socket.off("estado-actuadores");
    };
  }, []);

  const handleAccion = async (
    id: string,
    tipo: "encender" | "apagar" | "reiniciar"
  ) => {
    const lora = actuadores.find((a) => a.id === id);
    const alias = lora?.alias ?? "Lora";

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

  return (
    <main className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/2 flex flex-col gap-4 overflow-y-auto max-h-screen pr-2">
          <h1 className="text-2xl font-bold">Loras disponibles</h1>

          {actuadores
            .slice()
            .sort((a, b) => a.alias.localeCompare(b.alias))
            .map((act) => (
              <LoraCard
                key={act.id}
                id={act.id}
                alias={act.alias}
                ip={act.ip}
                estado={act.estado}
                motorEncendido={act.motorEncendido}
                relays={act.relays}
                gateway={{
                  alias: act.gateway?.alias ?? "N/A",
                  ip: act.gateway?.ip ?? "0.0.0.0",
                  estado: act.estadoGateway ?? "caido",
                }}
                onEncenderMotor={() => handleAccion(act.id, "encender")}
                onApagarMotor={() => handleAccion(act.id, "apagar")}
                onReiniciarGateway={() => handleAccion(act.id, "reiniciar")}
                loading={loadingId === act.id}
              />
            ))}

          <h2 className="text-xl font-semibold mt-4">Grupos creados</h2>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2"
          >
            + Crear Grupo
          </button>

          <CrearGrupoModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            empresaId={empresaId}
            loras={actuadores}
            gruposExistentes={grupos ?? []}
          />

          {grupos
            ?.slice()
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((grupo) => (
              <GrupoCard
                key={grupo.id}
                grupo={grupo}
                actuadoresActualizados={actuadores}
              />
            ))}
        </div>

        <div className="lg:w-1/2 w-full h-[300px] lg:h-auto">
          <MapView actuadores={actuadores} />
        </div>
      </div>
    </main>
  );
}
