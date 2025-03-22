"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  const [columns, setColumns] = useState<number>(1); // Controla o número de colunas

  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const nomeMusica = decodeURIComponent(pathParts[3] || "");

  useEffect(() => {
    const fetchMusica = async () => {
      try {
        const response = await fetch(
          `https://servidor-hinario.vercel.app/musicas/${encodeURIComponent(nomeMusica)}`
        );
        if (!response.ok) throw new Error("Música não encontrada");

        const data: Musica = await response.json();
        setMusica(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os detalhes da música.");
      }
    };

    fetchMusica();

    // Função para ajustar as colunas dependendo da largura da tela
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setColumns(2); // 2 colunas para telas médias
      } else {
        setColumns(1); // 1 coluna para telas pequenas
      }
    };

    // Adicionando event listener para detectar resize e ajustar o layout
    window.addEventListener("resize", handleResize);
    handleResize(); // Chama para definir o valor inicial

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [nomeMusica]);

  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="p-1 flex flex-col relative items-center min-h-screen bg-gray-100">
      {/* Botão para voltar */}
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 absolute top-5 left-5 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300 shadow-md text-sm sm:text-base"
      >
        ← Voltar
      </button>

      {musica ? (
        <div className="flex flex-col items-center mt-16 sm:mt-19 lg:mt-24"> {/* Adicionando margens superiores responsivas */}
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
          </div>

          {/* Área de texto responsiva com colunas */}
          <div className="mt-4 w-full">
            <pre
              className="p-5 bg-white shadow-md rounded-lg text-gray-900 whitespace-pre-wrap overflow-hidden"
              style={{
                columnCount: columns, // Usa a quantidade de colunas calculada
                columnGap: "3rem", // Espaço entre as colunas
                textAlign: "justify", // Justificar o texto
                fontSize: "clamp(6px, 3vw, 24px)", // Ajusta a fonte para ser bem pequena em telas muito pequenas (mínimo 8px), e maior para telas grandes
                lineHeight: "1.5", // Melhora a legibilidade
                padding: "1.5rem", // Aumenta o padding para dar mais espaço ao conteúdo
              }}
            >
              {abaAtiva === "letra" ? musica.letra : musica.cifra}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-gray-900">Carregando...</p>
      )}
    </div>
  );
}
