import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
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
      // Evitar duplicados
      if (!state.favorites.some(fav => fav.novel_id === action.payload.novel_id)) {
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
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, setLoading, setError } = favoritesSlice.actions;
export default favoritesSlice.reducer;