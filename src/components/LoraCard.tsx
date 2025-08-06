"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getGatewayIcon,
  getLoraIcon,
  getMotorIcon,
  getRelayIcon,
} from "@/utils/iconUtils";
import { Settings2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Actuador, Gateway } from "@/types/actuador";

interface LoraCardProps
  extends Pick<
    Actuador,
    "id" | "alias" | "ip" | "estado" | "motorEncendido" | "relays"
  > {
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
}: LoraCardProps) {
  const [hovered, setHovered] = useState(false);
  const bordeRojo = estado === "offline" || gateway.estado !== "ok";

  const iconoGateway = getGatewayIcon(gateway.estado);

  return (
    <div
      className={`relative p-4 bg-white rounded-lg shadow hover:shadow-md transition-all space-y-2 border ${
        bordeRojo ? "border-red-500" : "border-gray-200"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute top-2 right-3 flex items-center gap-1 text-gray-500 text-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Opciones de control</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{alias}</h2>
        <Image src={getLoraIcon(estado)} alt="estado" width={30} height={30} />
      </div>

      <p className="text-sm text-gray-500">IP: {ip}</p>

      <div className="text-sm">
        <p className="flex items-center gap-2">
          Gateway:
          <Image src={iconoGateway} alt="gw" width={30} height={30} />
          <span className="font-semibold">{gateway.alias}</span>
        </p>

        <p className="text-xs text-gray-500">
          Estado GW:{" "}
          <span
            className={
              gateway.estado === "ok"
                ? "text-green-600"
                : gateway.estado === "caido"
                ? "text-red-600"
                : "text-yellow-500"
            }
          >
            {gateway.estado === "reiniciando"
              ? "Reiniciando..."
              : gateway.estado}
          </span>
        </p>

        <p className="flex items-center gap-2 mt-1">
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
          <div className="flex gap-3 items-center mt-1">
            {[
              { key: "releGateway", label: "RG" },
              { key: "releValvula", label: "RV" },
              { key: "releMotor1", label: "RM1" },
              { key: "releMotor2", label: "RM2" },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center">
                <Image
                  src={getRelayIcon(relays[key as keyof typeof relays])}
                  alt={label}
                  title={label}
                  width={20}
                  height={20}
                  className={
                    relays[key as keyof typeof relays]
                      ? "opacity-100"
                      : "opacity-60"
                  }
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {estado === "online" && (
          <>
            <button
              onClick={motorEncendido ? onApagarMotor : onEncenderMotor}
              disabled={loading}
              className={`px-3 py-1 rounded text-white text-sm font-semibold transition flex items-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : motorEncendido
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : motorEncendido ? (
                "Apagar motor"
              ) : (
                "Encender motor"
              )}
            </button>

            {gateway.estado === "caido" && (
              <button
                onClick={onReiniciarGateway}
                disabled={loading}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ...
                  </>
                ) : (
                  "Reiniciar GW"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
