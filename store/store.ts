import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import authReducer from "./slices/authSlice";
import novelsReducer from "./slices/novelsSlice";
import favoritesReducer from "./slices/favoritesSlice";
import chaptersReducer from "./slices/chapterSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    novels: novelsReducer,
    favorites: favoritesReducer,
    chapters: chaptersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;