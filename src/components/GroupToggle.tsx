"use client";

import { useState } from "react";
import { gruposMock } from "@/data/grupos";

interface Props {
  onToggleGroup: (actuadorIds: string[]) => void;
}

export default function GroupToggle({ onToggleGroup }: Props) {
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null);

  return (
    <div className="mt-6 p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-lg font-bold">Grupos de Actuadores</h2>
      {gruposMock.map((grupo) => (
        <div key={grupo.id} className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{grupo.nombre}</span>
            <button
              onClick={async () => {
                setLoadingGroup(grupo.id);
                try {
                  // Enviar toggle por cada actuador del grupo
                  await Promise.all(
                    grupo.actuadores.map((id) =>
                      fetch(
                        `http://localhost:4000/api/actuadores/${id}/toggle`,
                        {
                          method: "POST",
                        }
                      )
                    )
                  );
                } catch (err) {
                  console.error("❌ Error grupo:", err);
                } finally {
                  setLoadingGroup(null);
                }
              }}
              disabled={loadingGroup === grupo.id}
              className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                loadingGroup === grupo.id
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingGroup === grupo.id ? "Cambiando..." : "Toggle Grupo"}
            </button>
          </div>
          <ul className="ml-2 list-disc text-sm text-gray-700">
            {grupo.actuadores.map((id) => (
              <li key={id}>Lora ID {id}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
