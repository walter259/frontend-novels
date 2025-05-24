import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Estado para manejar capítulos
interface ChaptersState {
  chapters: Chapter[];         // Lista de capítulos de una novela
  currentChapter: Chapter | null; // Capítulo actual que se está leyendo
  loading: boolean;            // Indicador de carga
  error: string | null;        // Mensaje de error (si ocurre)
}

// Estado inicial
const initialState: ChaptersState = {
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null,
};

// Slice de Redux para capítulos
const chaptersSlice = createSlice({
  name: "chapters",
  initialState,
  reducers: {
    // Establece la lista de capítulos de una novela
    setChapters(state, action: PayloadAction<Chapter[]>) {
      state.chapters = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Establece el capítulo actual que se está leyendo
    setCurrentChapter(state, action: PayloadAction<Chapter>) {
      state.currentChapter = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Añade un nuevo capítulo a la lista
    addChapter(state, action: PayloadAction<Chapter>) {
      state.chapters.push(action.payload);
      // Ordenamos los capítulos por número
      state.chapters.sort((a, b) => a.chapter_number - b.chapter_number);
      state.loading = false;
      state.error = null;
    },

    // Actualiza un capítulo existente
    updateChapter(state, action: PayloadAction<Chapter>) {
      const index = state.chapters.findIndex(
        (chapter) => chapter.id === action.payload.id
      );
      if (index !== -1) {
        state.chapters[index] = action.payload;
      }
      // Si estamos actualizando el capítulo actual, actualizarlo también
      if (state.currentChapter?.id === action.payload.id) {
        state.currentChapter = action.payload;
      }
      state.loading = false;
      state.error = null;
    },

    // Elimina un capítulo
    removeChapter(state, action: PayloadAction<number>) {
      state.chapters = state.chapters.filter(
        (chapter) => chapter.id !== action.payload
      );
      // Si eliminamos el capítulo actual, limpiarlo
      if (state.currentChapter?.id === action.payload) {
        state.currentChapter = null;
      }
      state.loading = false;
      state.error = null;
    },

    // Limpia los capítulos (por ejemplo, al cambiar de novela)
    clearChapters(state) {
      state.chapters = [];
      state.currentChapter = null;
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
export const {
  setChapters,
  setCurrentChapter,
  addChapter,
  updateChapter,
  removeChapter,
  clearChapters,
  setLoading,
  setError,
} = chaptersSlice.actions;

export default chaptersSlice.reducer;