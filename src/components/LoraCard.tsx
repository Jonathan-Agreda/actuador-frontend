"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getGatewayIcon,
  getLoraIcon,
  getMotorIcon,
  getRelayIcon,
} from "@/utils/iconUtils";

interface Gateway {
  alias: string;
  ip: string;
  estado: "ok" | "reiniciando" | "caido";
}

interface Relays {
  releMotor1: boolean;
  releMotor2: boolean;
  releGateway: boolean;
  releValvula: boolean;
}

interface Props {
  id: string;
  alias: string;
  ip: string;
  estado: "online" | "offline";
  motorEncendido: boolean;
  relays: Relays;
  gateway: Gateway;
  onEncenderMotor: () => void;
  onApagarMotor: () => void;
  onReiniciarGateway: () => void;
  loading: boolean;
}

export default function LoraCard({
  alias,
  ip,
  estado,
  motorEncendido,
  relays,
  gateway,
  onEncenderMotor,
  onApagarMotor,
  onReiniciarGateway,
  loading,
}: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-all space-y-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{alias}</h2>
        <Image src={getLoraIcon(estado)} alt="estado" width={30} height={30} />
      </div>

      <p className="text-sm text-gray-500">IP: {ip}</p>

      <div className="text-sm">
        <p className="flex items-center gap-2">
          Gateway:
          <Image
            src={getGatewayIcon(gateway.estado === "ok")}
            alt="gw"
            width={30}
            height={30}
          />
          <span className="font-semibold">{gateway.alias}</span>
        </p>
        <p className="flex items-center gap-2">
          Motor:
          <Image
            src={getMotorIcon(motorEncendido)}
            alt="motor"
            width={25}
            height={25}
          />
          <span className={motorEncendido ? "text-green-600" : "text-gray-600"}>
            {motorEncendido ? "Encendido" : "Apagado"}
          </span>
        </p>
        <div className="flex gap-2 items-center mt-1">
          Relés:
          {Object.entries(relays).map(([nombre, valor]) => (
            <Image
              key={nombre}
              src={getRelayIcon(valor)}
              alt={nombre}
              title={nombre}
              width={20}
              height={20}
              className={valor ? "opacity-100" : "opacity-60"}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={motorEncendido ? onApagarMotor : onEncenderMotor}
          disabled={loading}
          className={`px-3 py-1 rounded text-white text-sm font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : motorEncendido
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading
            ? "Procesando..."
            : motorEncendido
            ? "Apagar motor"
            : "Encender motor"}
        </button>
        <button
          onClick={onReiniciarGateway}
          disabled={loading}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          {loading ? "..." : "Reiniciar GW"}
        </button>
      </div>
    </div>
  );
}
