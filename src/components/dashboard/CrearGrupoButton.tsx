// components/dashboard/CrearGrupoButton.tsx
"use client";

interface Props {
  onClick: () => void;
}

export default function CrearGrupoButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2"
    >
      + Crear Grupo
    </button>
  );
}
