"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import dynamic from "next/dynamic";
import Image from "next/image";
import GroupToggle from "@/components/GroupToggle";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Gateway {
  ip: string;
  estado: "ok" | "reiniciando" | "caido";
}

interface Actuador {
  id: string;
  alias: string;
  ip: string;
  latitud: number;
  longitud: number;
  estado: "online" | "offline";
  relayEncendido: boolean;
  gateway: Gateway;
}

export default function DashboardPage() {
  const [actuadores, setActuadores] = useState<Actuador[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    socket.on("estado-actuadores", (data: Actuador[]) => {
      console.log("📡 Estados actualizados:", data);
      setActuadores(data);
    });

    return () => {
      socket.off("estado-actuadores");
    };
  }, []);

  return (
    <main className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Dashboard Actuadores</h1>
      <ul className="space-y-2">
        {actuadores.map((act) => (
          <li key={act.id} className="p-4 bg-white rounded shadow">
            <p className="font-semibold">{act.alias}</p>
            <p>
              Estado:{" "}
              <span
                className={
                  act.estado === "online" ? "text-green-600" : "text-red-600"
                }
              >
                {act.estado}
              </span>
            </p>
            <p>
              Gateway:{" "}
              <span
                className={
                  act.gateway.estado === "ok"
                    ? "text-green-600"
                    : act.gateway.estado === "reiniciando"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {act.gateway.estado}
              </span>
            </p>
            <button
              onClick={async () => {
                setLoadingId(act.id);
                try {
                  const res = await fetch(
                    `http://localhost:4000/api/actuadores/${act.id}/toggle`,
                    {
                      method: "POST",
                    }
                  );
                  const data = await res.json();
                  console.log("✅ Toggle enviado:", data.message);
                } catch (err) {
                  console.error("❌ Error al enviar toggle:", err);
                } finally {
                  setLoadingId(null);
                }
              }}
              disabled={loadingId === act.id}
              className={`mt-2 px-4 py-1 rounded text-white text-sm font-semibold flex items-center gap-2 ${
                act.relayEncendido
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500 hover:bg-gray-600"
              } ${loadingId === act.id ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loadingId === act.id ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Procesando...
                </>
              ) : act.relayEncendido ? (
                "Apagar"
              ) : (
                "Encender"
              )}
            </button>

            <div className="mt-2 flex items-center gap-2">
              <Image
                src={
                  act.relayEncendido
                    ? "/icons/relay-on.svg"
                    : "/icons/relay-off.svg"
                }
                alt="Relé"
                width={24}
                height={24}
                className={act.relayEncendido ? "pulse" : "opacity-70"}
              />
              <span className="text-sm">
                Relé: {act.relayEncendido ? "Encendido" : "Apagado"}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <GroupToggle
        onToggleGroup={(ids) => {
          // Llamado en caso de integración real
          console.log("Actuadores a alternar:", ids);
        }}
      />

      <MapView actuadores={actuadores} />
    </main>
  );
}
