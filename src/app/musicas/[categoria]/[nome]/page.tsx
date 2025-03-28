"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const formatarParaURL = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") 
    .toLowerCase();
};

interface Musica {
  nome: string;
  artista: string;
  categoria: string;
  letra: string;
  cifra: string;
  cifraSimplificada: string;
}

export default function MusicaDetalhes() {
  const [musica, setMusica] = useState<Musica | null>(null);
  const [error, setError] = useState<string>("");
  const [abaAtiva, setAbaAtiva] = useState<"letra" | "cifra" | "cifraSimplificada">("letra");
  const [columns, setColumns] = useState<number>(1);

  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/");

  const categoriaUrl = decodeURIComponent(pathParts[2] || "");
  const nomeMusicaUrl = decodeURIComponent(pathParts[3] || "");

  useEffect(() => {
    const fetchMusica = async () => {
      try {
        const response = await fetch("https://servidor-hinario.vercel.app/musicas");
        if (!response.ok) throw new Error("Erro ao buscar músicas");

        const data: Musica[] = await response.json();

        const musicaEncontrada = data.find(
          (musica) =>
            formatarParaURL(musica.categoria) === categoriaUrl &&
            formatarParaURL(musica.nome) === nomeMusicaUrl
        );

        if (!musicaEncontrada) throw new Error("Música não encontrada");

        setMusica(musicaEncontrada);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os detalhes da música.");
      }
    };

    fetchMusica();

    const handleResize = () => {
      setColumns(window.innerWidth >= 768 ? 2 : 1);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [categoriaUrl, nomeMusicaUrl]);

  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="p-1 flex flex-col relative items-center min-h-screen bg-gray-100">
      <button
        onClick={() => router.push(`/musicas/${formatarParaURL(musica?.categoria || "")}`)}
        disabled={!musica}
        className="mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 absolute top-5 left-5 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300 shadow-md text-sm sm:text-base"
      >
        ← Voltar
      </button>

      {musica ? (
        <div className="flex flex-col items-center mt-16 sm:mt-19 lg:mt-12">
          <h1 className="text-4xl font-bold text-gray-800">{musica.nome}</h1>
          <h2 className="text-lg text-gray-700">Artista: {musica.artista}</h2>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setAbaAtiva("letra")}
              className={`px-4 py-2 rounded-md ${
                abaAtiva === "letra" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Letra
            </button>
            <button
              onClick={() => setAbaAtiva("cifra")}
              className={`px-4 py-2 rounded-md ${
                abaAtiva === "cifra" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Cifra
            </button>
            <button
              onClick={() => setAbaAtiva("cifraSimplificada")}
              className={`px-4 py-2 rounded-md ${
                abaAtiva === "cifraSimplificada" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Cifra Simplificada
            </button>
          </div>

          <div className="mt-4 w-full">
            <pre
              className="p-5 bg-white shadow-md rounded-lg text-gray-900 whitespace-pre-wrap overflow-hidden"
              style={{
                columnCount: columns,
                columnGap: "3rem",
                textAlign: "justify",
                fontSize: "clamp(6px, 3vw, 24px)",
                lineHeight: "1.5",
                padding: "1.5rem",
              }}
            >
              {abaAtiva === "letra"
                ? musica.letra
                : abaAtiva === "cifra"
                ? musica.cifra
                : musica.cifraSimplificada}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-gray-900">Carregando...</p>
      )}
    </div>
  );
}
