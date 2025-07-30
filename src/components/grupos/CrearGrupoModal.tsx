"use client";

import { Dialog } from "@headlessui/react";
import { useCrearGrupo } from "@/hooks/useGrupos";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function CrearGrupoModal({
  open,
  onClose,
  empresaId,
  loras,
}: {
  open: boolean;
  onClose: () => void;
  empresaId: string;
  loras: any[];
}) {
  const [nombre, setNombre] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const { mutateAsync: crearGrupo, isLoading } = useCrearGrupo();

  const toggleLora = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (seleccionados.length === loras.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(loras.map((l) => l.id));
    }
  };

  const handleCrear = async () => {
    await crearGrupo({ nombre, empresaId, loraIds: seleccionados });
    setNombre("");
    setSeleccionados([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/40 z-40" />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
          <h2 className="text-xl font-semibold">Crear nuevo grupo</h2>
          <Input
            placeholder="Nombre del grupo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1 bg-gray-800">
            {/* Checkbox para seleccionar todos */}
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={seleccionados.length === loras.length}
                onChange={handleSelectAll}
              />
              Seleccionar todos
            </label>

            {loras.map((lora) => (
              <label
                key={lora.id}
                className="flex items-center gap-2 text-sm pl-1"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(lora.id)}
                  onChange={() => toggleLora(lora.id)}
                />
                {lora.alias}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => {
                setNombre("");
                setSeleccionados([]);
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCrear}
              disabled={isLoading || !nombre || seleccionados.length === 0}
            >
              {isLoading ? "Creando..." : "Crear Grupo"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
