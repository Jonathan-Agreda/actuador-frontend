import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useToggleProgramacion = () =>
  useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      await axios.patch(`/programacion-grupo/${id}`, { activo });
    },
  });
