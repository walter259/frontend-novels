import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  lastUserId: number | null;
  // Estado de carga por operación
  operationLoading: Record<string, boolean>;
}

const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
  lastUserId: null,
  operationLoading: {},
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<Favorite[]>) {
      state.favorites = action.payload;
      state.loading = false;
      state.error = null;
    },

    addFavorite(state, action: PayloadAction<Favorite>) {
      // Verificar que no exista ya antes de añadir
      const exists = state.favorites.some(fav => fav.novel_id === action.payload.novel_id);
      if (!exists) {
        state.favorites.push(action.payload);
      }
      state.loading = false;
      state.error = null;
    },

    removeFavorite(state, action: PayloadAction<number>) {
      state.favorites = state.favorites.filter((favorite) => favorite.id !== action.payload);
      state.loading = false;
      state.error = null;
    },

    setLoading(state) {
      state.loading = true;
      state.error = null;
    },

    clearLoading(state) {
      state.loading = false;
    },

    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },

    clearFavorites(state) {
      state.favorites = [];
      state.loading = false;
      state.error = null;
      state.lastUserId = null;
      state.operationLoading = {};
    },

    setCurrentUserId(state, action: PayloadAction<number | null>) {
      state.lastUserId = action.payload;
    },

    updateFavorite(state, action: PayloadAction<Favorite>) {
      const index = state.favorites.findIndex(fav => fav.id === action.payload.id);
      if (index >= 0) {
        state.favorites[index] = { ...state.favorites[index], ...action.payload };
      }
      state.loading = false;
      state.error = null;
    },

    // Estado de carga por operación
    setOperationLoading(state, action: PayloadAction<{ operation: string; loading: boolean }>) {
      const { operation, loading } = action.payload;
      if (loading) {
        state.operationLoading[operation] = true;
      } else {
        delete state.operationLoading[operation];
      }
    },

    clearOperationLoading(state) {
      state.operationLoading = {};
    },

    resetState() {
      return initialState;
    },
  },
});

export const { 
  setFavorites, 
  addFavorite, 
  removeFavorite,
  setLoading,
  clearLoading,
  setError, 
  clearError,
  clearFavorites,
  setCurrentUserId,
  updateFavorite,
  setOperationLoading,
  clearOperationLoading,
  resetState,
} = favoritesSlice.actions;

// Selectores para facilitar el acceso al estado
export const selectFavorites = (state: { favorites: FavoritesState }) => state.favorites.favorites;
export const selectFavoritesLoading = (state: { favorites: FavoritesState }) => state.favorites.loading;
export const selectFavoritesError = (state: { favorites: FavoritesState }) => state.favorites.error;
export const selectLastUserId = (state: { favorites: FavoritesState }) => state.favorites.lastUserId;
export const selectOperationLoading = (state: { favorites: FavoritesState }) => state.favorites.operationLoading;

// Selector para verificar si una novela es favorita
export const selectIsFavorite = (novelId: number) => (state: { favorites: FavoritesState }) => 
  state.favorites.favorites.some(fav => fav.novel_id === novelId);

// Selector para obtener favorito por novel_id
export const selectFavoriteByNovelId = (novelId: number) => (state: { favorites: FavoritesState }) => 
  state.favorites.favorites.find(fav => fav.novel_id === novelId);

// Selector para verificar si una operación específica está cargando
export const selectIsOperationLoading = (operation: string) => (state: { favorites: FavoritesState }) => 
  Boolean(state.favorites.operationLoading[operation]);

export default favoritesSlice.reducer;