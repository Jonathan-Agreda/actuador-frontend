// components/dashboard/ListaGrupos.tsx
"use client";

import { Grupo } from "@/types/grupo";
import { Actuador } from "@/types/actuador";
import GrupoCard from "../grupos/GrupoCard";

interface Props {
  grupos: Grupo[];
  actuadores: Actuador[];
}

export default function ListaGrupos({ grupos, actuadores }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {grupos
        .slice()
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((grupo) => (
          <GrupoCard
            key={grupo.id}
            grupo={grupo}
            actuadoresActualizados={actuadores}
          />
        ))}
    </div>
  );
}
