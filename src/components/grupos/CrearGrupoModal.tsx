"use client";

import { Dialog } from "@headlessui/react";
import { useCrearGrupo } from "@/hooks/useGrupos";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Actuador } from "@/types/actuador";
import { Grupo } from "@/types/grupo";

interface CrearGrupoModalProps {
  open: boolean;
  onClose: () => void;
  empresaId: string;
  loras: Pick<Actuador, "id" | "alias">[]; // ✅ solo lo necesario
  gruposExistentes: Grupo[];
}

export default function CrearGrupoModal({
  open,
  onClose,
  empresaId,
  loras,
  gruposExistentes,
}: CrearGrupoModalProps) {
  const [nombre, setNombre] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const { mutateAsync: crearGrupo, isPending } = useCrearGrupo();

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
    const nombreTrim = nombre.trim();

    if (!nombreTrim) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    const nombreExiste = gruposExistentes.some(
      (g) => g.nombre.toLowerCase() === nombreTrim.toLowerCase()
    );

    if (nombreExiste) {
      toast.error("Ya existe un grupo con ese nombre");
      return;
    }

    if (seleccionados.length === 0) {
      toast.error("Debes seleccionar al menos una Lora");
      return;
    }

    await crearGrupo({ nombre: nombreTrim, empresaId, loraIds: seleccionados });

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
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? "Creando..." : "Crear Grupo"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
