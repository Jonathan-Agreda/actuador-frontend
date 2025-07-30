// src/hooks/useGrupos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useGrupos = () => {
  return useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const res = await axios.get("/grupos");
      return res.data;
    },
  });
};

export const useCrearGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      nombre: string;
      empresaId: string;
      loraIds: string[];
    }) => {
      const res = await axios.post("/grupos", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
};
