"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { DivIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

// ✅ Ícono dinámico con alias arriba
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

// 🔁 Forzar redimensionamiento del mapa
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
  const lastAlertRef = useRef<number>(0); // ⏱️ Última alerta sonora

  // 🎧 Preload sonido
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

  // 🔊 Alerta inteligente (no repetir en bucle)
  useEffect(() => {
    if (!readyToPlay || actuadores.length === 0) return;

    const hayOffline = actuadores.some((a) => a.estado === "offline");

    if (hayOffline) {
      const now = Date.now();
      const elapsed = now - lastAlertRef.current;

      if (elapsed > 15000) {
        lastAlertRef.current = now;
        audioRef.current?.play().catch(() => {});
        navigator.vibrate?.([300, 100, 300]);
      }
    } else {
      lastAlertRef.current = 0;
    }
  }, [actuadores, readyToPlay]);

  return (
    <div className="h-full rounded shadow overflow-hidden z-0">
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
