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


// Componente para renderizar linha com cifra alinhada
const processarCifraComCores = (cifraTexto: string) => {
  const linhas = cifraTexto.split('\n');
  
  return linhas.map((linha, index) => {
    // Alterna cores: linhas ímpares (0, 2, 4...) com cor vermelha, pares (1, 3, 5...) com cor normal
    const isLinhaColorida = index % 2 === 0;
    
    return (
      <div key={index} style={{ margin: 0, padding: 0 }}>
        <span style={{ 
          color: isLinhaColorida ? '#2563eb' : '#374151', // Azul para linhas ímpares, cinza para pares
          fontWeight: 'bold' // Negrito para todas as linhas
        }}>
          {linha}
        </span>
        {index < linhas.length - 1 && '\n'}
      </div>
    );
  });
};

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
      const width = window.innerWidth;
      if (abaAtiva === "letra") {
        // Para letras: máximo 2 colunas em telas grandes, 1 em pequenas
        setColumns(width >= 1240 ? 2 : 1);
      } else {
        // Para cifras: mesmo comportamento das letras
        setColumns(width >= 1240 ? 2 : 1);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Chama na montagem do componente

    return () => window.removeEventListener("resize", handleResize);
  }, [categoriaUrl, nomeMusicaUrl, abaAtiva]); // Adiciona abaAtiva como dependência

  // Atualiza colunas quando a aba ativa muda
  useEffect(() => {
    const width = window.innerWidth;
    if (abaAtiva === "letra") {
      setColumns(width >= 1240 ? 2 : 1);
    } else {
      // Para cifras: mesmo comportamento das letras
      setColumns(width >= 1240 ? 2 : 1);
    }
  }, [abaAtiva]);

  if (error) return <div className="p-5 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <button
        onClick={() => router.push(`/musicas/${formatarParaURL(musica?.categoria || "")}`)}
        disabled={!musica}
        className="absolute top-2 left-2 z-10 px-3 py-1 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300 shadow-md text-sm"
      >
        ← Voltar
      </button>

      {musica ? (
        <>
          {/* Área da música - ocupa a maior parte da tela */}
          <div className="flex-1 p-2 pt-12 overflow-hidden">
            <div className="h-full w-full overflow-auto">
          {abaAtiva === "letra" ? (
              <pre
                className="bg-white w-full shadow-md rounded-lg overflow-auto h-full text-gray-700"
                style={{
                  columnCount: columns,
                  columnGap: "3rem",
                  columnFill: "auto",
                  textAlign: "justify",
                  fontSize: "clamp(12px, 3vw, 24px)",
                  lineHeight: "1.43",
                  padding: "0.5rem",
                  fontWeight: "bold",
                  fontFamily: "monospace"
                }}
              >
                {musica.letra}
              </pre>
            ) : (
              <div
                className="bg-white w-full shadow-md rounded-lg overflow-auto h-full text-gray-700"
                style={{
                  columnCount: "auto",
                  columnWidth: "400px",
                  columnGap: "clamp(7.5rem, 10vw, 2rem)", // 7.5rem em telas menores, 2rem em maiores
                  columnFill: "auto",
                  padding: "0.5rem",
                  fontSize: "clamp(10px, 2.8vw, 20px)",
                  lineHeight: "1.43",
                  whiteSpace: "pre",
                  fontFamily: "monospace"
                }}
              >
                {processarCifraComCores(abaAtiva === "cifra" ? musica.cifra : musica.cifraSimplificada)}
              </div>
            )}
             </div>
           </div>

           {/* Área de controles - parte inferior */}
           <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
             <div className="flex flex-col items-center gap-2">
               <h1 className="text-xl font-bold text-gray-800 text-center">{musica.nome}</h1>
               <h2 className="text-sm text-gray-600">Artista: {musica.artista}</h2>
               
               <div className="flex gap-2 flex-wrap justify-center">
                 <button
                   onClick={() => setAbaAtiva("letra")}
                   className={`px-3 py-1 rounded-md text-sm ${
                     abaAtiva === "letra" ? "bg-blue-500 text-white" : "bg-gray-200"
                   }`}
                 >
                   Letra
                 </button>
                 <button
                   onClick={() => setAbaAtiva("cifra")}
                   className={`px-3 py-1 rounded-md text-sm ${
                     abaAtiva === "cifra" ? "bg-blue-500 text-white" : "bg-gray-200"
                   }`}
                 >
                   Cifra
                 </button>
                 <button
                   onClick={() => setAbaAtiva("cifraSimplificada")}
                   className={`px-3 py-1 rounded-md text-sm ${
                     abaAtiva === "cifraSimplificada" ? "bg-blue-500 text-white" : "bg-gray-200"
                   }`}
                 >
                   Cifra Simplificada
                 </button>
               </div>
             </div>
           </div>
         </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-900">Carregando...</p>
        </div>
      )}
    </div>
  );
}