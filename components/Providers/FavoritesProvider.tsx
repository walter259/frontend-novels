"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getFavoritesAsync } from "@/service/favorites/favoritesService";

interface Props {
  children: React.ReactNode;
}

export default function FavoritesProvider({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { hasInitialized } = useSelector((state: RootState) => state.favorites);

  // Cargar favoritos globalmente cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id && !hasInitialized) {
      console.log("🔄 Loading favorites globally for user:", user.id);
      dispatch(getFavoritesAsync());
    }
  }, [dispatch, isAuthenticated, user?.id, hasInitialized]);

  return <>{children}</>;
} 