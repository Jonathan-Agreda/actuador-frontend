// components/dashboard/FiltrosLora.tsx
"use client";

interface Props {
  busquedaAlias: string;
  setBusquedaAlias: (value: string) => void;
  estadoLora: string;
  setEstadoLora: (value: string) => void;
  estadoGateway: string;
  setEstadoGateway: (value: string) => void;
  motorEncendido: string;
  setMotorEncendido: (value: string) => void;
}

export default function FiltrosLora({
  busquedaAlias,
  setBusquedaAlias,
  estadoLora,
  setEstadoLora,
  estadoGateway,
  setEstadoGateway,
  motorEncendido,
  setMotorEncendido,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <input
        type="text"
        placeholder="🔍 Buscar por alias..."
        value={busquedaAlias}
        onChange={(e) => setBusquedaAlias(e.target.value)}
        className="input input-bordered w-full"
      />

      <select
        value={estadoLora}
        onChange={(e) => setEstadoLora(e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="">Estado Lora (Todos)</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>

      <select
        value={estadoGateway}
        onChange={(e) => setEstadoGateway(e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="">Estado Gateway (Todos)</option>
        <option value="ok">OK</option>
        <option value="caido">Caído</option>
        <option value="reiniciando">Reiniciando</option>
      </select>

      <select
        value={motorEncendido}
        onChange={(e) => setMotorEncendido(e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="">Motor (Todos)</option>
        <option value="on">Encendido</option>
        <option value="off">Apagado</option>
      </select>
    </div>
  );
}
