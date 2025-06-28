import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  lastUserId: number | null;
  operationLoading: Record<string, boolean>;
  hasInitialized: boolean;
}

const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
  lastUserId: null,
  operationLoading: {},
  hasInitialized: false,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<Favorite[]>) {
      state.favorites = action.payload;
      state.loading = false;
      state.error = null;
      state.hasInitialized = true;
    },

    addFavorite(state, action: PayloadAction<Favorite>) {
      // Reemplaza cualquier favorito con el mismo novel_id
      state.favorites = [
        ...state.favorites.filter(
          (fav) => fav.novel_id !== action.payload.novel_id
        ),
        action.payload,
      ];
      state.loading = false;
      state.error = null;
    },

    removeFavorite(state, action: PayloadAction<number>) {
      state.favorites = state.favorites.filter(
        (favorite) => favorite.id !== action.payload
      );

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
      console.error(`❌ Favorites error: ${action.payload}`);
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
      state.hasInitialized = false;
    },

    setCurrentUserId(state, action: PayloadAction<number | null>) {
      // Si el usuario cambió, resetear el estado de inicialización
      if (state.lastUserId !== null && state.lastUserId !== action.payload) {
        state.hasInitialized = false;
      }
      state.lastUserId = action.payload;
    },

    updateFavorite(state, action: PayloadAction<Favorite>) {
      const index = state.favorites.findIndex(
        (fav) => fav.id === action.payload.id
      );
      if (index >= 0) {
        state.favorites[index] = {
          ...state.favorites[index],
          ...action.payload,
        };
      }
      state.loading = false;
      state.error = null;
    },

    setOperationLoading(
      state,
      action: PayloadAction<{ operation: string; loading: boolean }>
    ) {
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

// Selectores básicos
export const selectFavorites = (state: { favorites: FavoritesState }) =>
  state.favorites.favorites;
export const selectFavoritesLoading = (state: { favorites: FavoritesState }) =>
  state.favorites.loading;
export const selectFavoritesError = (state: { favorites: FavoritesState }) =>
  state.favorites.error;
export const selectLastUserId = (state: { favorites: FavoritesState }) =>
  state.favorites.lastUserId;
export const selectOperationLoading = (state: { favorites: FavoritesState }) =>
  state.favorites.operationLoading;
export const selectHasInitialized = (state: { favorites: FavoritesState }) =>
  state.favorites.hasInitialized;

// Selectores memoizados optimizados
export const selectIsFavoriteOptimized = createSelector(
  [
    selectFavorites,
    (state: { favorites: FavoritesState }, novelId: number) => novelId,
  ],
  (favorites, novelId) => {
    const result = favorites.some((fav) => fav.novel_id === novelId);

    return result;
  }
);

export const selectFavoriteByNovelIdOptimized = createSelector(
  [
    selectFavorites,
    (state: { favorites: FavoritesState }, novelId: number) => novelId,
  ],
  (favorites, novelId) => favorites.find((fav) => fav.novel_id === novelId)
);

// Selectores de compatibilidad
export const selectIsFavorite =
  (novelId: number) => (state: { favorites: FavoritesState }) =>
    state.favorites.favorites.some((fav) => fav.novel_id === novelId);

export const selectFavoriteByNovelId =
  (novelId: number) => (state: { favorites: FavoritesState }) =>
    state.favorites.favorites.find((fav) => fav.novel_id === novelId);

export const selectIsOperationLoading =
  (operation: string) => (state: { favorites: FavoritesState }) =>
    Boolean(state.favorites.operationLoading[operation]);

export default favoritesSlice.reducer;
