"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Musica {
  nome: string;
  artista: string;
  categoria: string;
  letra: string;
  cifra: string;
  url: string;
}

export default function MusicaDetalhes() {
  const [musica, setMusica] = useState<Musica | null>(null);
  const [error, setError] = useState<string>("");
  const [abaAtiva, setAbaAtiva] = useState<"letra" | "cifra">("letra");

  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const nomeMusica = decodeURIComponent(pathParts[3] || "");

  useEffect(() => {
    if (!nomeMusica) return;

    const fetchMusica = async () => {
      try {
        const response = await fetch(`https://servidor-hinario.vercel.app/musicas/${encodeURIComponent(nomeMusica)}`);
        if (!response.ok) throw new Error("Música não encontrada");

        const data: Musica = await response.json();
        setMusica(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os detalhes da música.");
      }
    };

    fetchMusica();
  }, [nomeMusica]);

  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="p-5">
      {musica ? (
        <>
          <h1 className="text-3xl font-bold">{musica.nome}</h1>
          <h2 className="text-lg text-gray-600">Artista: {musica.artista}</h2>

          {/* Botões para alternar entre Letra e Cifra */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setAbaAtiva("letra")}
              className={`px-4 py-2 rounded-md ${abaAtiva === "letra" ? "bg-blue-500 text-white" : "bg-gray-700"}`}
            >
              Letra
            </button>
            <button
              onClick={() => setAbaAtiva("cifra")}
              className={`px-4 py-2 rounded-md ${abaAtiva === "cifra" ? "bg-blue-500 text-white" : "bg-gray-700"}`}
            >
              Cifra
            </button>
          </div>

          {/* Exibição da aba selecionada */}
          <pre className="p-3 bg-gray-700 rounded-md mt-4 whitespace-pre-wrap">
            {abaAtiva === "letra" ? musica.letra : musica.cifra}
          </pre>

          <a
            href={musica.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Ver no Cifra Club
          </a>
        </>
      ) : (
        <p className="text-gray-500">Carregando...</p>
      )}
    </div>
  );
}
