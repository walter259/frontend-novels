// pages/novels/page.tsx
"use client";

import React, { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { getNovelsAsync } from "@/service/novels/novelsService";
import { getFavoritesAsync } from "@/service/favorites/favoritesService";

// Lazy load del componente SearchNovel
const SearchNovel = lazy(() => import("./components/SearchNovel"));

// Componente de loading para toda la página
const PageSkeleton = () => (
  <div className="w-full flex flex-col items-center p-4 animate-pulse">
    {/* Skeleton del input de búsqueda */}
    <div className="mb-4 flex justify-center w-full">
      <div className="w-full max-w-md h-10 bg-gray-200 rounded-full"></div>
    </div>

    {/* Skeleton de los botones de categorías */}
    <div className="mb-6 hidden md:flex flex-wrap justify-center gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-8 w-20 bg-gray-200 rounded-full"></div>
      ))}
    </div>

    {/* Skeleton de la lista de novelas */}
    <div className="w-full max-w-7xl">
      <div className="w-full grid grid-cols-1 gap-4 p-4 place-content-center">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden bg-background shadow-sm rounded-lg"
          >
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
  </div>
);

export default function Novels() {
  const dispatch = useDispatch<AppDispatch>();
  const { novels, loading } = useSelector((state: RootState) => state.novels);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { hasInitialized: favoritesInitialized, loading: favoritesLoading } =
    useSelector((state: RootState) => state.favorites);

  useEffect(() => {
    // Cargar novelas si aún no están cargadas
    if (novels.length === 0 && !loading) {
      dispatch(getNovelsAsync());
    }
  }, [dispatch, novels.length, loading]);

  useEffect(() => {
    // ÚNICA carga de favoritos - solo desde aquí
    if (
      isAuthenticated &&
      user?.id &&
      !favoritesInitialized &&
      !favoritesLoading
    ) {
      dispatch(getFavoritesAsync());
    }
  }, [
    dispatch,
    isAuthenticated,
    user?.id,
    favoritesInitialized,
    favoritesLoading,
  ]);

  // Mostrar skeleton mientras se cargan las novelas iniciales
  if (loading && novels.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="w-full">
      <Suspense fallback={<PageSkeleton />}>
        <SearchNovel initialNovels={novels} />
      </Suspense>
    </div>
  );
}
