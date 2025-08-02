import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ProgramacionGrupo } from "@/types/programacionGrupo";

export const useProgramacionesGrupo = (grupoId: string) => {
  return useQuery<ProgramacionGrupo[]>({
    queryKey: ["programaciones-grupo", grupoId],
    queryFn: async () => {
      const res = await axios.get("/programacion-grupo");
      return res.data.filter((p: ProgramacionGrupo) => p.grupoId === grupoId);
    },
    placeholderData: [],
  });
};
