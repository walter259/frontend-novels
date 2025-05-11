// store/slices/novelsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface NovelsState {
  novels: Novel[];
  loading: boolean;
  error: string | null;
}

const initialState: NovelsState = {
  novels: [],
  loading: false,
  error: null,
};

const novelsSlice = createSlice({
  name: "novels",
  initialState,
  reducers: {
    setNovels(state, action: PayloadAction<Novel[]>) {
      state.novels = action.payload;
      state.loading = false;
      state.error = null;
    },
    addNovel(state, action: PayloadAction<Novel>) {
      state.novels.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateNovels(state, action: PayloadAction<Novel>) {
      const index = state.novels.findIndex((novel) => novel.id === action.payload.id);
      if (index !== -1) {
        state.novels[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    removeNovel(state, action: PayloadAction<string>) {
      state.novels = state.novels.filter((novel) => novel.id !== action.payload);
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

export const { setNovels, addNovel, updateNovels, removeNovel, setLoading, setError } = novelsSlice.actions;
export default novelsSlice.reducer;