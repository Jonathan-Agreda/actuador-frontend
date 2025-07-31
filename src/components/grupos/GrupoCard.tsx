"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useEliminarGrupo } from "@/hooks/useEliminarGrupo";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { toast } from "sonner";
import { Actuador } from "@/types/actuador";
import { Grupo } from "@/types/grupo";
import { ApiError } from "@/types/types";
import { ejecutarAccionGrupal } from "@/services/loraService";
import Image from "next/image";
import { getGatewayIcon } from "@/utils/iconUtils";

interface GrupoCardProps {
  grupo: Grupo;
  actuadoresActualizados: Actuador[];
}

export default function GrupoCard({
  grupo,
  actuadoresActualizados,
}: GrupoCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { mutate: eliminarGrupo, isPending } = useEliminarGrupo();

  const getEstadoLora = (id: string) =>
    actuadoresActualizados.find((a) => a.id === id);

  const handleEliminar = () => {
    eliminarGrupo(grupo.id, {
      onSuccess: () => toast.success("Grupo eliminado correctamente"),
      onError: (error: unknown) => {
        const err = error as ApiError;
        const mensaje =
          err?.response?.data?.message ||
          err?.message ||
          "Error inesperado al eliminar el grupo";

        toast.error(mensaje);
        console.error("Error al eliminar grupo:", error);
      },
    });
  };

  const handleAccionGrupal = async (
    accion: "encender" | "apagar" | "reiniciar"
  ) => {
    const idsLoras = grupo.GrupoActuador.map((ga) => ga.actuador.id);

    const aliasMap = grupo.GrupoActuador.reduce(
      (acc, ga) => ({ ...acc, [ga.actuador.id]: ga.actuador.alias }),
      {} as Record<string, string>
    );

    const toastId = toast.loading(`Ejecutando acción grupal: ${accion}`);

    try {
      const { exitosas, fallidas, mensajes } = await ejecutarAccionGrupal(
        idsLoras,
        aliasMap,
        accion
      );

      toast.success(`Acción grupal completada: ${accion}`, { id: toastId });

      if (fallidas.length > 0 && exitosas.length === 0) {
        toast.warning(
          `Ningún Lora fue ${
            accion === "reiniciar" ? "reiniciado" : accion + "do"
          }`
        );
      } else if (fallidas.length > 0) {
        toast.warning(
          `${exitosas.length} exitosos, ${fallidas.length} fallidos`
        );
      }

      mensajes.forEach((msg) => toast.error(msg));
    } catch {
      toast.error(`Error general al ejecutar acción: ${accion}`, {
        id: toastId,
      });
    }
  };

  return (
    <div className="bg-gray-900 text-white border border-gray-700 rounded-xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{grupo.nombre}</h3>
        <span className="text-sm text-gray-400">
          {grupo.GrupoActuador.length} Loras
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {grupo.GrupoActuador.map(({ actuador }) => {
          const actualizado = getEstadoLora(actuador.id);
          const estadoLora = actualizado?.estado || actuador.estado;
          const estadoGateway =
            actualizado?.estadoGateway || actuador.estadoGateway;
          const aliasGateway =
            actualizado?.gateway?.alias || actuador.gateway?.alias || "GW";

          return (
            <div
              key={actuador.id}
              className="flex items-center gap-1 bg-white text-gray-900 rounded px-2 py-1"
            >
              <Badge
                variant={estadoLora === "online" ? "success" : "destructive"}
              >
                {actuador.alias}
              </Badge>
              <Image
                src={getGatewayIcon(estadoGateway)}
                alt="Estado GW"
                width={16}
                height={16}
                title={`${aliasGateway} - ${estadoGateway}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-2 flex-wrap gap-y-2">
        <div className="flex gap-2 flex-wrap">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAccionGrupal("encender")}
          >
            Encender Motor
          </Button>

          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => handleAccionGrupal("apagar")}
          >
            Apagar Motor
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => handleAccionGrupal("reiniciar")}
          >
            Reiniciar GW
          </Button>
        </div>

        <Button
          className="bg-red-700 hover:bg-red-800 text-white flex items-center gap-2"
          onClick={() => setShowDialog(true)}
        >
          <Trash2 size={16} />
          Eliminar
        </Button>
      </div>

      <ConfirmDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleEliminar}
        title={`¿Eliminar grupo "${grupo.nombre}"?`}
        description="Esta acción no se puede deshacer."
        confirmText={isPending ? "Eliminando..." : "Eliminar grupo"}
        isLoading={isPending}
      />
    </div>
  );
}
