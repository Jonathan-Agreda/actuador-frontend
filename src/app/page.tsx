"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import dynamic from "next/dynamic";
import LoraCard from "@/components/LoraCard";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="text-center p-4">Cargando mapa...</div>,
});

export default function DashboardPage() {
  const [actuadores, setActuadores] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActuadores = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_WS_URL}/api/actuadores`
        );
        const data = await res.json();
        setActuadores(data);
      } catch (err) {
        console.error("Error inicial:", err);
      }
    };
    fetchActuadores();
  }, []);

  useEffect(() => {
    socket.on("estado-actuadores", (data: any[]) => {
      setActuadores((prev) =>
        prev.map((act) => {
          const nuevo = data.find((a) => a.id === act.id);
          if (!nuevo) return act;
          return { ...act, ...nuevo };
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
    setLoadingId(id);
    try {
      const endpoint =
        tipo === "encender"
          ? "encender-motor"
          : tipo === "apagar"
          ? "apagar-motor"
          : "reiniciar-gateway";

      await fetch(
        `${process.env.NEXT_PUBLIC_API_WS_URL}/api/actuadores/${id}/${endpoint}`,
        {
          method: "POST",
        }
      );
    } catch (err) {
      console.error("Error al procesar:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Panel izquierdo */}
        <div className="lg:w-1/2 flex flex-col gap-4 overflow-y-auto max-h-screen pr-2">
          <h1 className="text-2xl font-bold">Loras disponibles</h1>
          {actuadores.map((act) => (
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
                estado: act.estadoGateway ? "ok" : "caido",
              }}
              onEncenderMotor={() => handleAccion(act.id, "encender")}
              onApagarMotor={() => handleAccion(act.id, "apagar")}
              onReiniciarGateway={() => handleAccion(act.id, "reiniciar")}
              loading={loadingId === act.id}
            />
          ))}
        </div>

        {/* Panel derecho: Mapa */}
        <div className="lg:w-1/2 w-full h-[300px] lg:h-auto">
          <MapView actuadores={actuadores} />
        </div>
      </div>
    </main>
  );
}
