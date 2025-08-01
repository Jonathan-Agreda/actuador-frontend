// components/dashboard/VistaArbol.tsx
"use client";

import Image from "next/image";
import { Actuador } from "@/types/actuador";
import LoraCard from "../LoraCard";
import { getGatewayIcon, getLoraIcon, getMotorIcon } from "@/utils/iconUtils";

interface Props {
  actuadores: Actuador[];
  loraSeleccionado: Actuador | null;
  setLoraSeleccionado: (a: Actuador) => void;
  busquedaAlias: string;
  setBusquedaAlias: (v: string) => void;
  handleAccion: (id: string, tipo: "encender" | "apagar" | "reiniciar") => void;
  loadingId: string | null;
}

export default function VistaArbol({
  actuadores,
  loraSeleccionado,
  setLoraSeleccionado,
  busquedaAlias,
  setBusquedaAlias,
  handleAccion,
  loadingId,
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-1/2">
        <h2 className="text-md font-semibold mb-1">Lista de Loras</h2>
        <input
          type="text"
          placeholder="Buscar por alias..."
          value={busquedaAlias}
          onChange={(e) => setBusquedaAlias(e.target.value)}
          className="input input-bordered w-full mb-2"
        />

        <ul className="border rounded p-2 max-h-[450px] overflow-y-auto">
          {actuadores
            .filter((act) =>
              act.alias.toLowerCase().includes(busquedaAlias.toLowerCase())
            )
            .sort((a, b) => a.alias.localeCompare(b.alias))
            .map((act) => (
              <li
                key={act.id}
                className={`px-2 py-1 cursor-pointer rounded hover:bg-gray-100 ${
                  loraSeleccionado?.id === act.id
                    ? "bg-blue-100 font-semibold"
                    : ""
                }`}
                onClick={() => setLoraSeleccionado(act)}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={getLoraIcon(act.estado)}
                    alt="lora"
                    width={20}
                    height={20}
                  />
                  <span>{act.alias}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                    (
                    <Image
                      src={getGatewayIcon(act.estadoGateway)}
                      alt="gw"
                      width={16}
                      height={16}
                    />
                    <Image
                      src={getMotorIcon(act.motorEncendido)}
                      alt="motor"
                      width={16}
                      height={16}
                    />
                    )
                  </span>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div className="lg:w-1/2">
        {loraSeleccionado && (
          <LoraCard
            id={loraSeleccionado.id}
            alias={loraSeleccionado.alias}
            ip={loraSeleccionado.ip}
            estado={loraSeleccionado.estado}
            motorEncendido={loraSeleccionado.motorEncendido}
            relays={loraSeleccionado.relays}
            gateway={{
              alias: loraSeleccionado.gateway?.alias ?? "N/A",
              ip: loraSeleccionado.gateway?.ip ?? "0.0.0.0",
              estado: loraSeleccionado.estadoGateway ?? "caido",
            }}
            onEncenderMotor={() =>
              handleAccion(loraSeleccionado.id, "encender")
            }
            onApagarMotor={() => handleAccion(loraSeleccionado.id, "apagar")}
            onReiniciarGateway={() =>
              handleAccion(loraSeleccionado.id, "reiniciar")
            }
            loading={loadingId === loraSeleccionado.id}
          />
        )}
      </div>
    </div>
  );
}
