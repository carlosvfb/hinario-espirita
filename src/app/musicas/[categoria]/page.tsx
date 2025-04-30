"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname();

  // Extrair categoria da URL
  const categoriaUrl = decodeURIComponent(pathname.split("/").pop() || "");

  // Buscar músicas apenas uma vez
  useEffect(() => {
    if (!categoriaUrl) return;

    const fetchMusicas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://servidor-hinario.vercel.app/musicas");
        const data: Musica[] = await response.json();

        const musicasDaCategoria = data.filter(
          (musica) => formatarParaURL(musica.categoria) === categoriaUrl
        );

        // Ordenação alfabética por nome da música
        const musicasOrdenadas = [...musicasDaCategoria].sort((a, b) => 
          a.nome.localeCompare(b.nome, 'pt-BR')
        );

        setMusicas(musicasOrdenadas);

        if (musicasOrdenadas.length > 0) {
          setCategoriaExibida(musicasOrdenadas[0].categoria);
        } else {
          setCategoriaExibida("Categoria não encontrada");
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as músicas dessa categoria.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicas();
  }, [categoriaUrl]);

  // Usar useMemo para calcular músicas filtradas apenas quando necessário
  const musicasFiltradas = useMemo(() => {
    if (!termoBusca.trim()) {
      return musicas;
    }

    const termoLowerCase = termoBusca.toLowerCase();
    return musicas.filter(
      (musica) =>
        musica.nome.toLowerCase().includes(termoLowerCase) ||
        musica.artista.toLowerCase().includes(termoLowerCase)
    );
  }, [musicas, termoBusca]);

  // Debounce para o input de busca
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTermoBusca(value);
  }, []);

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

      <h1 className="text-4xl font-bold text-gray-800 mb-8 mt-16 sm:mt-19 lg:mt-12">{categoriaExibida}</h1>

      {/* Campo de busca */}
      <div className="relative w-full max-w-md mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Buscar música ou artista..."
          value={termoBusca}
          onChange={handleInputChange}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center w-full">
          <p className="text-gray-500 text-lg">Carregando músicas...</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {musicasFiltradas.length > 0 ? (
            musicasFiltradas.map((musica) => {
              const categoriaFormatada = formatarParaURL(musica.categoria);
              const musicaFormatada = formatarParaURL(musica.nome);

              return (
                <li key={`${musica.nome}-${musica.artista}`} className="flex justify-center">
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
            <p className="text-gray-500 text-lg col-span-full text-center">
              Nenhuma música encontrada.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}