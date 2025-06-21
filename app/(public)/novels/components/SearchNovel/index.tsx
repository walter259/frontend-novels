// components/SearchNovel.tsx
"use client";

import { useState, Suspense, lazy, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Lazy load de NovelList
const NovelList = lazy(() => import("../NovelList"));

// Skeleton para la lista de novelas
const NovelListSkeleton = () => (
  <div className="w-full max-w-7xl">
    <div className="w-full grid grid-cols-1 gap-4 p-4 place-content-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden bg-background shadow-sm rounded-lg animate-pulse">
          <div className="flex p-4 gap-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-200 rounded-sm"></div>
            </div>
            <div className="flex-grow space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="hidden md:flex flex-col gap-2 justify-center ml-auto">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface SearchNovelProps {
  initialNovels: Novel[];
}

export default function SearchNovel({ initialNovels }: SearchNovelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const novels = useMemo(() => initialNovels || [], [initialNovels]);

  // Memoizar las categorías para evitar recalcular en cada render
  const categories = useMemo(() => 
    Array.from(
      new Set(
        novels
          .map((novel) => novel.category)
          .filter((category): category is string => category !== null && category !== undefined)
      )
    ), [novels]
  );

  // Memoizar las novelas filtradas para mejor rendimiento
  const filteredNovels = useMemo(() => 
    novels.filter((novel) => {
      const matchesTitle = novel.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? novel.category === selectedCategory : true;
      return matchesTitle && matchesCategory;
    }), [novels, searchTerm, selectedCategory]
  );

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
      <div className="mb-6 hidden md:flex flex-wrap justify-center gap-2">
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

      {/* Lista de novelas filtradas con lazy loading */}
      <Suspense fallback={<NovelListSkeleton />}>
        <NovelList novels={filteredNovels} />
      </Suspense>
    </div>
  );
}