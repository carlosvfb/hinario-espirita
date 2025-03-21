"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Função para remover os acentos
const removerAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

interface Musica {
  nome: string;
  categoria: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [, setMusicas] = useState<Musica[]>([]);

  useEffect(() => {
    const fetchMusicas = async () => {
      const response = await fetch("https://servidor-hinario.vercel.app/musicas");
      const data: Musica[] = await response.json();
      setMusicas(data);

      const categoriasUnicas = [
        ...new Set(data.map((musica) => musica.categoria)),
      ];
      setCategorias(categoriasUnicas);
    };

    fetchMusicas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Categorias</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {categorias.map((categoria) => (
          <li key={categoria} className="flex justify-center">
            <Link href={`/musicas/${removerAcentos(categoria)}`}>
              <button className="w-full text-center text-2xl font-semibold p-6 bg-white shadow-lg rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-200 hover:scale-105 transition duration-300">
                {categoria}
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
