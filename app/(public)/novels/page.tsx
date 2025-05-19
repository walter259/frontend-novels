// pages/novels/page.tsx
"use client"
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import SearchNovel from "./components/SearchNovel";
import { getNovelsAsync } from "@/service/novels/novelsService";
import { getFavoritesAsync } from "@/service/favorites/favoritesService";

export default function Novels() {
  const dispatch = useDispatch<AppDispatch>();
  const novels = useSelector((state: RootState) => state.novels.novels);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // Cargar novelas si aún no están cargadas
    if (novels.length === 0) {
      dispatch(getNovelsAsync());
    }
    
    // Cargar favoritos si el usuario está autenticado
    if (isAuthenticated) {
      dispatch(getFavoritesAsync());
    }
  }, [dispatch, novels.length, isAuthenticated]);

  return (
    <div className="w-full">
      <SearchNovel initialNovels={novels} />
    </div>
  );
}