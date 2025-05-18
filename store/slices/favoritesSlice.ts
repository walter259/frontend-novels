import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Estado para manejar favoritos
interface FavoritesState {
  favorites: Favorite[]; // Lista de novelas favoritas
  loading: boolean;      // Indicador de carga
  error: string | null;  // Mensaje de error (si ocurre)
}

// Estado inicial vacío
const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
};

// Slice de Redux para favoritos
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Establece la lista de favoritos (p. ej. al cargar desde backend)
    setFavorites(state, action: PayloadAction<Favorite[]>) {
      state.favorites = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Agrega un favorito si no está repetido (por `novel_id`)
    addFavorite(state, action: PayloadAction<Favorite>) {
      if (!state.favorites.some(fav => fav.novel_id === action.payload.novel_id)) {
        state.favorites.push(action.payload);
      }
      state.loading = false;
      state.error = null;
    },

    // Elimina un favorito por su ID interno
    removeFavorite(state, action: PayloadAction<number>) {
      state.favorites = state.favorites.filter((favorite) => favorite.id !== action.payload);
      state.loading = false;
      state.error = null;
    },

    // Marca el estado como "cargando"
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    // Establece un mensaje de error
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Exportar acciones y reducer
export const { setFavorites, addFavorite, removeFavorite, setLoading, setError } = favoritesSlice.actions;
export default favoritesSlice.reducer;