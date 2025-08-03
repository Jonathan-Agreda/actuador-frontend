"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios"; // instancia personalizada
import axios from "axios"; // librería original para isAxiosError

interface Props {
  grupoId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const diasSemana = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

export default function CrearProgramacionModal({
  grupoId,
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const [horaInicio, setHoraInicio] = useState("06:00");
  const [horaFin, setHoraFin] = useState("18:00");
  const [frecuencia, setFrecuencia] = useState("diario");
  const [dias, setDias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleDia = (dia: string) => {
    setDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = async () => {
    if (!horaInicio || !horaFin || !frecuencia) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    if (frecuencia === "dias_especificos" && dias.length === 0) {
      toast.error("Selecciona al menos un día");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/programacion-grupo", {
        grupoId,
        horaInicio,
        horaFin,
        frecuencia,
        ...(frecuencia === "dias_especificos" ? { dias } : {}),
      });

      toast.success("Programación creada correctamente");
      onClose();
      onCreated?.();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const respuesta = error.response?.data;

        let mensaje = "Error al crear la programación";

        if (respuesta) {
          if (Array.isArray(respuesta.message)) {
            mensaje = respuesta.message.join(", ");
          } else if (typeof respuesta.message === "string") {
            mensaje = respuesta.message;
          }
        }

        toast.error(mensaje);
      } else {
        toast.error("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white p-6 text-gray-900 shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-bold">
            Crear programación
          </Dialog.Title>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Hora inicio</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Hora fin</label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Frecuencia</label>
            <select
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            >
              <option value="una_vez">Una vez</option>
              <option value="diario">Diario</option>
              <option value="dias_especificos">Días específicos</option>
            </select>
          </div>

          {frecuencia === "dias_especificos" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Días</label>
              <div className="grid grid-cols-2 gap-2">
                {diasSemana.map((dia) => (
                  <label key={dia} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={dias.includes(dia)}
                      onChange={() => toggleDia(dia)}
                    />
                    {dia}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Crear"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
