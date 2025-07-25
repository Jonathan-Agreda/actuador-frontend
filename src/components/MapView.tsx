"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { useEffect } from "react";

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

// 🟢 Íconos
const iconOnline = new Icon({
  iconUrl: "/icons/online.svg",
  iconSize: [25, 25],
});
const iconOffline = new Icon({
  iconUrl: "/icons/offline.svg",
  iconSize: [25, 25],
});

// 🔁 Forzar redimensionamiento del mapa
function ResizeMapOnDataChange({ trigger }: { trigger: any }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100); // leve delay para esperar DOM layout
  }, [trigger, map]);
  return null;
}

export default function MapView({ actuadores }: Props) {
  const initialCenter: LatLngExpression = [-2.154, -79.9];

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
              icon={act.estado === "online" ? iconOnline : iconOffline}
            >
              <Popup>
                <div className="text-sm">
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
