import axios from "@/lib/axios";

export const ejecutarAccionGrupal = async (
  lorasIds: string[],
  aliasMap: Record<string, string>,
  accion: "encender" | "apagar" | "reiniciar"
): Promise<{ exitosas: string[]; fallidas: string[]; mensajes: string[] }> => {
  const exitosas: string[] = [];
  const fallidas: string[] = [];
  const mensajes: string[] = [];

  const endpoint = (id: string) => {
    if (accion === "encender") return `/actuadores/${id}/encender-motor`;
    if (accion === "apagar") return `/actuadores/${id}/apagar-motor`;
    return `/actuadores/${id}/reiniciar-gateway`;
  };

  const peticiones = lorasIds.map(async (id) => {
    const alias = aliasMap[id] || id;
    try {
      await axios.post(endpoint(id));
      exitosas.push(id);
    } catch (err: any) {
      const rawMsg =
        err?.response?.data?.message || `Error al ejecutar ${accion}`;
      const msg = `❌ ${alias}: ${rawMsg}`;
      console.error(msg);
      fallidas.push(id);
      mensajes.push(msg);
    }
  });

  await Promise.all(peticiones);
  return { exitosas, fallidas, mensajes };
};
