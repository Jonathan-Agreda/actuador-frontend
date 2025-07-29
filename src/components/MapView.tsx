"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { DivIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { getLoraIcon, getGatewayIcon, getMotorIcon } from "@/utils/iconUtils";

interface Gateway {
  alias: string;
  ip: string;
}

interface Relays {
  releMotor1: boolean;
  releMotor2: boolean;
  releGateway: boolean;
  releValvula: boolean;
}

interface Actuador {
  id: string;
  alias: string;
  latitud: number;
  longitud: number;
  estado: "online" | "offline";
  estadoGateway: boolean;
  gateway: Gateway;
  motorEncendido: boolean;
  relays: Relays;
}

interface Props {
  actuadores: Actuador[];
}

const createCustomIcon = (
  alias: string,
  estado: "online" | "offline",
  estadoGateway: boolean,
  motorEncendido: boolean,
  gatewayAlias: string
): L.DivIcon => {
  return new L.DivIcon({
    className: "custom-marker",
    html: `
  <div style="
    background: white;
    border-radius: 10px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    text-align: center;
    filter: drop-shadow(0 0 3px rgba(0,0,0,0.15));
  ">
    <div style="font-weight: 600; font-size: 12px;">${alias}</div>

    <img src="${getLoraIcon(estado)}"
      style="width: 32px; height: 32px; margin: 4px auto; filter: drop-shadow(0 0 2px rgba(0,0,0,0.25));" />

    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.8);
        border-radius: 6px;
        padding: 3px;
        box-shadow: 0 0 1px rgba(0,0,0,0.3);
      ">
        <img src="${getGatewayIcon(estadoGateway)}" title="Gateway"
          style="width: 26px; height: 26px;" />
      </div>

      <div style="
        background: rgba(255, 255, 255, 0.8);
        border-radius: 6px;
        padding: 3px;
        box-shadow: 0 0 1px rgba(0,0,0,0.3);
      ">
        <img src="${getMotorIcon(motorEncendido)}" title="Motor"
          style="width: 26px; height: 26px;" />
      </div>
    </div>

    <div style="font-size: 10px; color: #444; font-weight: 500; margin-top: 4px;">
      ${gatewayAlias}
    </div>
  </div>
  `,
    iconSize: [60, 80],
    iconAnchor: [30, 40],
  });
};

function ResizeMapOnDataChange({ trigger }: { trigger: number }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [trigger, map]);
  return null;
}

export default function MapView({ actuadores }: Props) {
  const initialCenter: LatLngExpression = [-2.154, -79.9];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [muted, setMuted] = useState(false);
  const lastAlertRef = useRef<number>(0);
  const cantidadOffline = actuadores.filter(
    (a) => a.estado === "offline"
  ).length;

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/alert.mp3");
    audioRef.current.loop = false;

    const handleClick = () => {
      audioRef.current?.play().then(() => {
        audioRef.current?.pause();
        setReadyToPlay(true);
      });
      navigator.vibrate?.(100);
      document.removeEventListener("click", handleClick);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (!readyToPlay || actuadores.length === 0 || muted) return;

    const hayOffline = cantidadOffline > 0;
    if (hayOffline) {
      const now = Date.now();
      const elapsed = now - lastAlertRef.current;

      if (elapsed > 15000) {
        lastAlertRef.current = now;
        audioRef.current?.play().catch(() => {});
        navigator.vibrate?.([300, 100, 300]);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("¡Alerta Lora!", {
            body: `Hay ${cantidadOffline} Lora${
              cantidadOffline > 1 ? "s" : ""
            } en estado offline.`,
            icon: "/icons/offline.svg",
          });
        }
      }
    } else {
      lastAlertRef.current = 0;
    }
  }, [actuadores, readyToPlay, muted]);

  return (
    <div className="w-full h-full min-h-[300px] rounded shadow overflow-hidden z-0 relative">
      <div className="absolute top-2 right-2 z-[999]">
        <button
          onClick={() => setMuted(!muted)}
          className={`relative rounded-full p-2 shadow-lg transition-colors duration-200 ${
            muted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
          title={muted ? "Sonido desactivado" : "Sonido activado"}
        >
          {muted ? <BellOff size={20} /> : <Bell size={20} />}
          {cantidadOffline > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full border border-white">
              {cantidadOffline}
            </span>
          )}
        </button>
      </div>

      <MapContainer
        center={initialCenter}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <ResizeMapOnDataChange trigger={actuadores.length} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {actuadores.map((act) => (
          <Marker
            key={act.id}
            position={[act.latitud, act.longitud]}
            icon={createCustomIcon(
              act.alias,
              act.estado,
              act.estadoGateway,
              act.motorEncendido,
              act.gateway.alias
            )}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{act.alias}</p>
                <p>IP: {act.gateway.ip}</p>
                <p>
                  Estado Lora:{" "}
                  <span
                    className={
                      act.estado === "online"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {act.estado}
                  </span>
                </p>
                <p>
                  Motor:{" "}
                  <span
                    className={
                      act.motorEncendido ? "text-green-600" : "text-gray-600"
                    }
                  >
                    {act.motorEncendido ? "Encendido" : "Apagado"}
                  </span>
                </p>
                <p>
                  Gateway:{" "}
                  <span
                    className={
                      act.estadoGateway ? "text-green-600" : "text-red-600"
                    }
                  >
                    {act.estadoGateway ? "online" : "offline"}
                  </span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
