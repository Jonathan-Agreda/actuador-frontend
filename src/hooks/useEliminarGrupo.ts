import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useEliminarGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/grupos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
};
