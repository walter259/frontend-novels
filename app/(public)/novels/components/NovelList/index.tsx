// components/NovelList.tsx
"use client";

import { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNovelsAsync } from "@/service/novels/novelsService";
import { getFavoritesAsync } from "@/service/favorites/favoritesService";
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
  novels: Novel[];
}

export default function NovelList({ novels }: NovelListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.novels);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { favorites, loading: favoritesLoading } = useSelector((state: RootState) => state.favorites);

  useEffect(() => {
    if (!novels.length && !loading) {
      dispatch(getNovelsAsync());
    }
  }, [dispatch, novels, loading]);

  useEffect(() => {
    if (isAuthenticated && !favoritesLoading && favorites.length === 0) {
      dispatch(getFavoritesAsync());
    }
  }, [dispatch, isAuthenticated, favoritesLoading, favorites.length]);

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!novels.length) {
    return <div className="text-center p-4">No novels found.</div>;
  }

  return (
    <div className="w-full grid grid-cols-1 gap-4 p-4 place-content-center">
      {novels.map((novel) => (
        <Suspense key={novel.id} fallback={<CardNovelSkeleton />}>
          <CardNovel novel={novel} />
        </Suspense>
      ))}
    </div>
  );
}