// components/SearchNovel.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NovelList from "../components/NovelList";


interface SearchNovelProps {
  initialNovels: Novel[];
}

export default function SearchNovel({ initialNovels }: SearchNovelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Obtener categorías únicas de las novelas
  const categories = Array.from(
    new Set(initialNovels.map((novel) => novel.category).filter((category) => category !== null))
  ) as string[];

  // Filtrar novelas por título y categoría
  const filteredNovels = initialNovels.filter((novel) => {
    const matchesTitle = novel.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? novel.category === selectedCategory : true;
    return matchesTitle && matchesCategory;
  });

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      {/* Input de búsqueda */}
      <div className="mb-4 flex justify-center w-full">
        <Input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-full shadow-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
        />
      </div>

      {/* Botones de categorías */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full text-sm ${
              selectedCategory === category
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {category}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={clearFilters}
          className="rounded-full text-sm border-gray-300 hover:bg-gray-100"
        >
          Limpiar Filtros
        </Button>
      </div>

      {/* Lista de novelas filtradas */}
      <div className="w-full max-w-7xl">
        <NovelList novels={filteredNovels} />
      </div>
    </div>
  );
}