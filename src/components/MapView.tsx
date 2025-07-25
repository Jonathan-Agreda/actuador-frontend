"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { DivIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";

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

interface Props {
  actuadores: Actuador[];
}

const getCustomIcon = (alias: string, estado: "online" | "offline"): DivIcon =>
  new L.DivIcon({
    className: "custom-marker",
    html: `
      <div class="marker-label-container">
        <div class="marker-label">${alias}</div>
        <div class="${estado === "offline" ? "blinking-wrapper" : ""}">
          <img src="/icons/${estado}.svg" class="w-[25px] h-[25px]" />
        </div>
      </div>
    `,
    iconSize: [25, 40],
    iconAnchor: [12.5, 25],
  });

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

  // 🟡 Solicita permiso de notificación si existe API
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // 🔊 Preload sonido
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

  // 🚨 Alertas: sonido, vibración, notificación (protegido)
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

        // ✅ Solo si existe y está permitido
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("¡Alerta Lora!", {
              body: `Hay ${cantidadOffline} Lora${
                cantidadOffline > 1 ? "s" : ""
              } en estado offline.`,
              icon: "/icons/offline.svg",
            });
          }
        }
      }
    } else {
      lastAlertRef.current = 0;
    }
  }, [actuadores, readyToPlay, muted]);

  return (
    <div className="w-full h-full min-h-[300px] rounded shadow overflow-hidden z-0 relative">
      {/* 🔔 Botón sonido + contador */}
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
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <ResizeMapOnDataChange trigger={actuadores.length} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {actuadores.map((act) => {
          const markerPos: LatLngExpression = [act.latitud, act.longitud];
          return (
            <Marker
              key={act.id}
              position={markerPos}
              icon={getCustomIcon(act.alias, act.estado)}
            >
              <Popup>
                <div
                  className={`text-sm p-2 rounded shadow ${
                    act.estado === "offline" ? "border border-red-500" : ""
                  }`}
                >
                  <strong>{act.alias}</strong>
                  <br />
                  Estado:{" "}
                  <span
                    className={
                      act.estado === "online"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {act.estado}
                  </span>
                  <br />
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
                  <br />
                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      src={
                        act.relayEncendido
                          ? "/icons/relay-on.svg"
                          : "/icons/relay-off.svg"
                      }
                      alt="Relé"
                      width={20}
                      height={20}
                      className={act.relayEncendido ? "pulse" : "opacity-70"}
                    />
                    <span>
                      Relé: {act.relayEncendido ? "Encendido" : "Apagado"}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
