"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const formatarParaURL = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .toLowerCase();
};

interface Musica {
  nome: string;
  artista: string;
  categoria: string;
}

export default function MusicasPorCategoria() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [categoriaExibida, setCategoriaExibida] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  // Extrair categoria da URL
  const categoriaUrl = decodeURIComponent(pathname.split("/").pop() || "");

  useEffect(() => {
    if (!categoriaUrl) return;

    const fetchMusicas = async () => {
      try {
        const response = await fetch("https://servidor-hinario.vercel.app/musicas");
        const data: Musica[] = await response.json();

        const musicasFiltradas = data.filter(
          (musica) => formatarParaURL(musica.categoria) === categoriaUrl
        );

        setMusicas(musicasFiltradas);

        if (musicasFiltradas.length > 0) {
          setCategoriaExibida(musicasFiltradas[0].categoria);
        } else {
          setCategoriaExibida("Categoria não encontrada");
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as músicas dessa categoria.");
      }
    };

    fetchMusicas();
  }, [categoriaUrl]);

  if (error) {
    return <div className="p-5 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen relative bg-gray-100 flex flex-col justify-center items-center p-5">
      <button
        onClick={() => router.push("/")}
        className="mb-6 px-6 py-3 absolute top-5 left-5 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300 shadow-md"
      >
        ← Voltar
      </button>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">{categoriaExibida}</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {musicas.length > 0 ? (
          musicas.map((musica) => {
            const categoriaFormatada = formatarParaURL(musica.categoria);
            const musicaFormatada = formatarParaURL(musica.nome);

            return (
              <li key={musica.nome} className="flex justify-center">
                <button
                  onClick={() =>
                    router.push(`/musicas/${categoriaFormatada}/${musicaFormatada}`)
                  }
                  className="w-full text-center text-2xl font-semibold p-6 bg-white shadow-lg rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-200 hover:scale-105 transition duration-300"
                >
                  {musica.nome} - {musica.artista}
                </button>
              </li>
            );
          })
        ) : (
          <p className="text-gray-500 text-lg">Não há músicas nessa categoria.</p>
        )}
      </ul>
    </div>
  );
}
