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
    <div>
      <h1>Categorias</h1>
      <ul>
        {categorias.map((categoria) => (
          <li key={categoria}>
            <Link href={`/musicas/${removerAcentos(categoria)}`}>
              <button>{categoria}</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

