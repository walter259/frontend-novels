import { AppDispatch } from "@/store/store";
import { setFavorites, addFavorite, removeFavorite, setLoading, setError } from "@/store/slices/favoritesSlice";
import api from "../api";

interface FavoriteResponse {
  favorites: Favorite[];
}

interface AddFavoriteResponse {
  favorite: Favorite;
  message: string;
}

// Obtener todos los favoritos del usuario
export const getFavoritesAsync = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const response = await api.get<FavoriteResponse>("/favorites");
    const favorites = response.data.favorites;
    dispatch(setFavorites(favorites));
    return favorites;
  } catch (error) {
    dispatch(setError("Error fetching favorites"));
    console.error("Error fetching favorites:", error);
    throw error;
  }
};

// Añadir una novela a favoritos
export const addFavoriteAsync = (novelId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const response = await api.post<AddFavoriteResponse>("/favorites", { novel_id: novelId });
    const favorite = response.data.favorite;
    dispatch(addFavorite(favorite));
    return favorite;
  } catch (error) {
    dispatch(setError("Error adding favorite"));
    console.error("Error adding favorite:", error);
    throw error;
  }
};

// Eliminar una novela de favoritos
export const removeFavoriteAsync = (favoriteId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    await api.delete(`/favorites/${favoriteId}`);
    dispatch(removeFavorite(favoriteId));
    return true;
  } catch (error) {
    dispatch(setError(`Error removing favorite ${favoriteId}`));
    console.error(`Error removing favorite ${favoriteId}:`, error);
    throw error;
  }
};