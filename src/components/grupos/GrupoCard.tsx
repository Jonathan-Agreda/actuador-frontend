"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useEliminarGrupo } from "@/hooks/useEliminarGrupo";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { toast } from "sonner";
import { Actuador } from "@/types/actuador";
import { Grupo } from "@/types/grupo";
import { ApiError } from "@/types/types";
import { ejecutarAccionGrupal } from "@/services/loraService";
import Image from "next/image";
import { getGatewayIcon, getMotorIcon } from "@/utils/iconUtils";
import { useProgramacionesGrupo } from "@/hooks/useProgramacionesGrupo";
import CrearProgramacionModal from "./CrearProgramacionModal";
import { useQueryClient } from "@tanstack/react-query";
import { useEliminarProgramacion } from "@/hooks/useEliminarProgramacion";
import { useToggleProgramacion } from "@/hooks/useToggleProgramacion";

interface GrupoCardProps {
  grupo: Grupo;
  actuadoresActualizados: Actuador[];
}

export default function GrupoCard({
  grupo,
  actuadoresActualizados,
}: GrupoCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [programacionAEliminar, setProgramacionAEliminar] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();

  const { data: programaciones = [] } = useProgramacionesGrupo(grupo.id);
  const { mutate: eliminarGrupo, isPending } = useEliminarGrupo();
  const eliminarProgramacion = useEliminarProgramacion();
  const toggleProgramacion = useToggleProgramacion();

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
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{grupo.nombre}</h3>
        <span className="text-sm text-gray-400">
          {grupo.GrupoActuador.length} Loras
        </span>
      </div>

      {/* Loras */}
      <div className="flex flex-wrap gap-2">
        {grupo.GrupoActuador.map(({ actuador }) => {
          const actualizado = getEstadoLora(actuador.id);
          const estadoLora = actualizado?.estado || actuador.estado;
          const estadoGateway =
            actualizado?.estadoGateway || actuador.estadoGateway;
          const aliasGateway =
            actualizado?.gateway?.alias || actuador.gateway?.alias || "GW";
          const motor = actualizado?.motorEncendido ?? actuador.motorEncendido;

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
                alt="GW"
                width={16}
                height={16}
                title={`${aliasGateway} - ${estadoGateway}`}
              />
              <Image
                src={getMotorIcon(motor)}
                alt="Motor"
                width={16}
                height={16}
                title={`Motor ${motor ? "encendido" : "apagado"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Programaciones */}
      <div>
        <h4 className="text-sm font-semibold">Programaciones</h4>
        {programaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay programaciones</p>
        ) : (
          <ul className="space-y-1 text-sm mt-1">
            {programaciones.map((p) => (
              <li
                key={p.id}
                className="border rounded-md p-2 bg-white text-gray-900 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <strong>
                      {p.horaInicio} - {p.horaFin}
                    </strong>
                    <span className="text-xs text-muted-foreground ml-2">
                      {p.frecuencia === "dias_especificos"
                        ? p.dias.join(", ")
                        : p.frecuencia}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await toggleProgramacion.mutateAsync({
                            id: p.id,
                            activo: !p.activo,
                          });
                          toast.success(
                            `Programación ${
                              p.activo ? "desactivada" : "activada"
                            }`
                          );
                          queryClient.invalidateQueries({
                            queryKey: ["programaciones-grupo", grupo.id],
                          });
                        } catch {
                          toast.error("Error al cambiar el estado");
                        }
                      }}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        p.activo ? "bg-amber-700" : "bg-green-700"
                      } text-white`}
                    >
                      {p.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => setProgramacionAEliminar(p.id)}
                      className="text-xs px-2 py-1 rounded bg-red-600 text-white font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="text-xs mt-1">
                  Estado:{" "}
                  <span
                    className={p.activo ? "text-green-600" : "text-red-500"}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="default"
          size="sm"
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} className="mr-1" /> Programar motor
        </Button>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap items-center pt-2 gap-2">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAccionGrupal("encender")}
          >
            Encender motor
          </Button>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => handleAccionGrupal("apagar")}
          >
            Apagar motor
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => handleAccionGrupal("reiniciar")}
          >
            Reiniciar GW
          </Button>
        </div>
        <div className="ml-auto">
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-1"
            onClick={() => setShowDialog(true)}
          >
            <Trash2 size={14} />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Modales */}
      <CrearProgramacionModal
        grupoId={grupo.id}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          queryClient.invalidateQueries({
            queryKey: ["programaciones-grupo", grupo.id],
          });
        }}
      />

      <ConfirmDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleEliminar}
        title={`¿Eliminar grupo "${grupo.nombre}"?`}
        description="Esta acción no se puede deshacer."
        confirmText={isPending ? "Eliminando..." : "Eliminar grupo"}
        isLoading={isPending}
      />

      <ConfirmDialog
        open={!!programacionAEliminar}
        onClose={() => setProgramacionAEliminar(null)}
        onConfirm={async () => {
          if (!programacionAEliminar) return;
          try {
            await eliminarProgramacion.mutateAsync(programacionAEliminar);
            toast.success("Programación eliminada");
            queryClient.invalidateQueries({
              queryKey: ["programaciones-grupo", grupo.id],
            });
          } catch {
            toast.error("Error al eliminar");
          } finally {
            setProgramacionAEliminar(null);
          }
        }}
        title="¿Eliminar programación?"
        description="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={eliminarProgramacion.isPending}
      />
    </div>
  );
}
