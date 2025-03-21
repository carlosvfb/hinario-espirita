"use client";

import React, { useEffect, useState, useRef } from "react";
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

  const preRef = useRef<HTMLPreElement>(null);
  const [fontSize, setFontSize] = useState(16);

  // Função para ajustar o tamanho da fonte dinamicamente sem cortar as letras
  const ajustaFonte = () => {
    if (preRef.current) {
      const larguraDiv = preRef.current.clientWidth; // Largura da div
      const alturaDiv = preRef.current.clientHeight; // Altura da div
      const larguraTexto = preRef.current.scrollWidth; // Largura do conteúdo
      const alturaTexto = preRef.current.scrollHeight; // Altura do conteúdo

      // Ajuste da fonte baseado na largura da div e garantindo que o texto ocupe a área
      let novaFonte = (larguraDiv / larguraTexto) * fontSize * 0.9;

      // Ajuste para garantir que a fonte não ultrapasse a altura da div
      const fontRatioHeight = (alturaDiv / alturaTexto) * 0.9;
      novaFonte = Math.min(novaFonte, fontRatioHeight * fontSize);

      // Atualizar o tamanho da fonte
      setFontSize(novaFonte);
    }
  };

  // Ajusta o tamanho da fonte assim que o componente for montado
  useEffect(() => {
    ajustaFonte();
  }, []);

  // Ajusta a fonte ao redimensionar a tela
  useEffect(() => {
    const onResize = () => ajustaFonte();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="p-5">
      {musica ? (
        <>
          <h1 className="text-3xl font-bold">{musica.nome}</h1>
          <h2 className="text-lg text-gray-900">Artista: {musica.artista}</h2>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setAbaAtiva("letra")}
              className={`px-4 py-2 rounded-md ${abaAtiva === "letra" ? "bg-blue-500 text-gray-900" : "bg-gray-200"}`}
            >
              Letra
            </button>
            <button
              onClick={() => setAbaAtiva("cifra")}
              className={`px-4 py-2 rounded-md ${abaAtiva === "cifra" ? "bg-blue-500 text-gray-900" : "bg-gray-200"}`}
            >
              Cifra
            </button>
          </div>

          <pre
            ref={preRef}
            style={{ fontSize: `${fontSize}px` }}
            className="p-3 w-full h-full bg-gray-200 text-gray-900 rounded-md mt-4 whitespace-pre overflow-hidden"
          >
            {abaAtiva === "letra" ? musica.letra : musica.cifra}
          </pre>
        </>
      ) : (
        <p className="text-gray-900">Carregando...</p>
      )}
    </div>
  );
}
