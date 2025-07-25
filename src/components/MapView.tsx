"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";

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

const iconOnline = new Icon({
  iconUrl: "/icons/online.svg",
  iconSize: [25, 25],
});

const iconOffline = new Icon({
  iconUrl: "/icons/offline.svg",
  iconSize: [25, 25],
});

export default function MapView({ actuadores }: Props) {
  return (
    <div className="h-[500px] rounded shadow overflow-hidden z-0">
      <MapContainer
        center={[-2.154, -79.9]} // centro inicial
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {actuadores.map((act) => (
          <Marker
            key={act.id}
            position={[act.latitud, act.longitud]}
            icon={act.estado === "online" ? iconOnline : iconOffline}
          >
            <Popup>
              <div className="text-sm">
                <strong>{act.alias}</strong>
                <br />
                Estado:{" "}
                <span
                  className={
                    act.estado === "online" ? "text-green-600" : "text-red-600"
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
        ))}
      </MapContainer>
    </div>
  );
}
