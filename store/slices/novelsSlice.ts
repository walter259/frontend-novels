import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Estado para manejar la lista de novelas
interface NovelsState {
  novels: Novel[];
  loading: boolean;
  error: string | null;
}

// Estado inicial vacío
const initialState: NovelsState = {
  novels: [],
  loading: false,
  error: null,
};

// Slice de Redux para novelas
const novelsSlice = createSlice({
  name: "novels",
  initialState,
  reducers: {
    // Establece la lista completa de novelas (usualmente tras una carga desde backend)
    setNovels(state, action: PayloadAction<Novel[]>) {
      state.novels = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Agrega una nueva novela a la lista
    addNovel(state, action: PayloadAction<Novel>) {
      state.novels.push(action.payload);
      state.loading = false;
      state.error = null;
    },

    // Actualiza una novela existente por su ID
    updateNovels(state, action: PayloadAction<Novel>) {
      const index = state.novels.findIndex((novel) => novel.id === action.payload.id);
      if (index !== -1) {
        state.novels[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },

    // Elimina una novela por su ID
    removeNovel(state, action: PayloadAction<number>) {
      state.novels = state.novels.filter((novel) => novel.id !== action.payload);
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

export const { setNovels, addNovel, updateNovels, removeNovel, setLoading, setError } = novelsSlice.actions;
export default novelsSlice.reducer;