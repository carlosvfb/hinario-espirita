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

// Função para processar cifras no estilo Cifra Club com alinhamento perfeito
const processarCifraParaCifraClub = (cifraTexto: string) => {
  const linhas = cifraTexto.split('\n');
  const resultado: Array<{ acordes: string; letra: string; alinhado: boolean }> = [];
  
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Padrão mais robusto para detectar acordes
    const temAcordes = /^[\s]*([A-G][#b]?[m]?[0-9]*[\s]+)*[A-G][#b]?[m]?[0-9]*[\s]*$/.test(linha) && 
                      linha.trim().length > 0 && 
                      linha.trim().length < 80 && 
                      !/[a-z]/.test(linha.replace(/[A-G][#b]?m/g, ''));
    
    if (temAcordes) {
      const proximaLinha = i + 1 < linhas.length ? linhas[i + 1] : '';
      resultado.push({
        acordes: linha,
        letra: proximaLinha,
        alinhado: true
      });
      i++; // Pula a próxima linha pois já foi processada
    } else if (linha.trim().length > 0) {
      resultado.push({
        acordes: '',
        letra: linha,
        alinhado: false
      });
    } else {
      resultado.push({
        acordes: '',
        letra: linha,
        alinhado: false
      });
    }
  }
  
  return resultado;
};

// Função para alinhar acordes com as letras de forma precisa
const criarLinhaAlinhada = (acordes: string, letra: string) => {
  if (!acordes.trim()) {
    return { acordesFormatados: '', letraFormatada: letra };
  }

  // Remove espaços extras e divide os acordes
  const acordesArray = acordes.trim().split(/\s+/).filter(a => a.length > 0);
  const letraLimpa = letra.trim();
  
  if (acordesArray.length === 0 || letraLimpa.length === 0) {
    return { acordesFormatados: acordes, letraFormatada: letra };
  }

  // Calcula posições dos acordes baseado no comprimento da letra
  const posicoes: number[] = [];
  const espacoDisponivel = Math.max(letraLimpa.length, 40); // Mínimo de 40 caracteres
  
  if (acordesArray.length === 1) {
    posicoes.push(0);
  } else {
    // Distribui os acordes uniformemente
    for (let i = 0; i < acordesArray.length; i++) {
      const posicao = Math.floor((espacoDisponivel * i) / (acordesArray.length - 1));
      posicoes.push(posicao);
    }
  }

  // Constrói a linha de acordes alinhada
  let acordesFormatados = '';
  let posicaoAtual = 0;

  acordesArray.forEach((acorde, index) => {
    const posicaoDesejada = posicoes[index];
    
    if (posicaoDesejada >= posicaoAtual) {
      const espacos = posicaoDesejada - posicaoAtual;
      acordesFormatados += ' '.repeat(espacos) + acorde;
    } else {
      // Se não há espaço suficiente, adiciona pelo menos um espaço
      acordesFormatados += ' ' + acorde;
    }
    
    posicaoAtual = acordesFormatados.length;
  });

  return { acordesFormatados, letraFormatada: letra };
};

// Componente para renderizar linha com cifra alinhada
const LinhaComCifra = ({ acordes, letra, alinhado }: { acordes: string; letra: string; alinhado: boolean }) => {
  if (!alinhado) {
    return (
      <div className="linha-sem-cifra" style={{ marginBottom: '0.3em' }}>
        <div style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{letra}</div>
      </div>
    );
  }

  const { acordesFormatados, letraFormatada } = criarLinhaAlinhada(acordes, letra);

  return (
    <div className="linha-com-cifra" style={{ marginBottom: '0.8em', fontFamily: 'monospace' }}>
      <div 
        style={{ 
          color: '#2563eb', 
          fontWeight: 'bold', 
          fontSize: '0.9em',
          whiteSpace: 'pre',
          marginBottom: '0.1em',
          minHeight: '1.2em'
        }}
      >
        {acordesFormatados}
      </div>
      <div 
        style={{ 
          color: '#374151', 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.3'
        }}
      >
        {letraFormatada}
      </div>
    </div>
  );
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
                className="bg-white shadow-md rounded-lg text-gray-900 whitespace-pre-wrap overflow-auto h-full"
                style={{
                  columnCount: columns,
                  columnGap: "3rem",
                  textAlign: "justify",
                  fontSize: "clamp(8px, 2.5vw, 20px)",
                  lineHeight: "1.4",
                  padding: "1rem",
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
                  columnGap: "2rem",
                  columnFill: "auto",
                  padding: "1.5rem",
                  fontSize: "clamp(12px, 2.2vw, 16px)",
                  lineHeight: "1.4"
                }}
              >
                {(() => {
                  const cifraTexto = abaAtiva === "cifra" ? musica.cifra : musica.cifraSimplificada;
                  const linhasProcessadas = processarCifraParaCifraClub(cifraTexto);
                  
                  return linhasProcessadas.map((item, index) => (
                    <LinhaComCifra
                      key={index}
                      acordes={item.acordes}
                      letra={item.letra}
                      alinhado={item.alinhado}
                    />
                  ));
                })()}
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