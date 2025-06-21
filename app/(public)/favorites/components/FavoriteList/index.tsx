"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getFavoritesAsync } from "@/service/favorites/favoritesService";
import FavoriteCard from "../FavoriteCard";

export default function FavoriteList() {
  const dispatch = useDispatch();
  const { favorites, loading, error } = useSelector(
    (state: RootState) => state.favorites
  );
  console.log("Favorites:", favorites);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(getFavoritesAsync() as any);
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-8">Cargando favoritos...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">
          No tienes novelas en tus favoritos.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <FavoriteCard key={favorite.id} favorite={favorite} />
          ))}
        </div>
      )}
    </div>
  );
}
