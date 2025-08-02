import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useEliminarProgramacion = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/programacion-grupo/${id}`);
    },
  });
