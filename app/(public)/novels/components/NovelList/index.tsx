// components/NovelList.tsx
"use client";

import { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNovelsAsync } from "@/service/novels/novelsService";
import { RootState, AppDispatch } from "@/store/store";

// Lazy load del componente CardNovel
const CardNovel = lazy(() => import("../CardNovel"));

// Componente de loading para cada tarjeta
const CardNovelSkeleton = () => (
  <div className="overflow-hidden bg-background shadow-sm rounded-lg animate-pulse">
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
);

interface NovelListProps {
  novels?: Novel[];
}

export default function NovelList({ novels: novelsProp }: NovelListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { novels: storeNovels, loading, error } = useSelector((state: RootState) => state.novels);

  // Proteger contra undefined - usar novelas del prop o del store
  const novels = Array.isArray(novelsProp) ? novelsProp : 
                Array.isArray(storeNovels) ? storeNovels : [];

  // Solo cargar novelas si es necesario - NO favoritos
  useEffect(() => {
    if (novels.length === 0 && !loading) {
      console.log('📚 NovelList: Loading novels from store');
      dispatch(getNovelsAsync());
    }
  }, [dispatch, novels.length, loading]);

  console.log(`📋 NovelList render:`, {
    novelsProp: novelsProp?.length || 0,
    storeNovels: storeNovels?.length || 0,
    novels: novels.length,
    loading,
    error: !!error
  });

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Error: {error}</p>
        <button 
          onClick={() => dispatch(getNovelsAsync())}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading && novels.length === 0) {
    return (
      <div className="w-full grid grid-cols-1 gap-4 p-4 place-content-center">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardNovelSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No se encontraron novelas.</p>
        {!loading && (
          <button 
            onClick={() => dispatch(getNovelsAsync())}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Cargar novelas
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 gap-4 p-4 place-content-center">
      {novels.map((novel) => {
        if (!novel || !novel.id) {
          console.warn('⚠️ Invalid novel data:', novel);
          return null;
        }
        
        return (
          <Suspense key={novel.id} fallback={<CardNovelSkeleton />}>
            <CardNovel novel={novel} />
          </Suspense>
        );
      })}
    </div>
  );
}