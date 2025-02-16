"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const removerAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

interface Musica {
  nome: string;
  artista: string;
  categoria: string;
}

export default function MusicasPorCategoria() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  // Extrair a categoria da URL
  const categoria = decodeURIComponent(pathname.split("/").pop() || "");

  useEffect(() => {
    if (!categoria) return;

    const fetchMusicas = async () => {
      try {
        const response = await fetch("https://servidor-hinario.vercel.app/musicas");
        const data: Musica[] = await response.json();

        const musicasFiltradas = data.filter((musica) =>
          removerAcentos(musica.categoria.toLowerCase()) === removerAcentos(categoria.toLowerCase())
        );

        setMusicas(musicasFiltradas);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as músicas dessa categoria.");
      }
    };

    fetchMusicas();
  }, [categoria]);

  if (error) {
    return <div className="p-5 text-red-500">{error}</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Músicas da Categoria: {categoria}</h1>
      <ul className="space-y-3">
        {musicas.length > 0 ? (
          musicas.map((musica) => (
            <li key={musica.nome} className="flex justify-between items-center">
              <button
                onClick={() =>
                  router.push(`/musicas/${encodeURIComponent(musica.categoria)}/${encodeURIComponent(musica.nome)}`)
                }
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
              >
                {musica.nome} - {musica.artista}
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500">Não há músicas nessa categoria.</p>
        )}
      </ul>
    </div>
  );
}
