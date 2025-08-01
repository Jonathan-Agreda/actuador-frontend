// components/dashboard/VistaTarjetas.tsx
"use client";

import { Actuador } from "@/types/actuador";
import LoraCard from "../LoraCard";

interface Props {
  actuadores: Actuador[];
  handleAccion: (id: string, tipo: "encender" | "apagar" | "reiniciar") => void;
  loadingId: string | null;
}

export default function VistaTarjetas({
  actuadores,
  handleAccion,
  loadingId,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            estado: act.estadoGateway ?? "caido",
          }}
          onEncenderMotor={() => handleAccion(act.id, "encender")}
          onApagarMotor={() => handleAccion(act.id, "apagar")}
          onReiniciarGateway={() => handleAccion(act.id, "reiniciar")}
          loading={loadingId === act.id}
        />
      ))}
    </div>
  );
}
