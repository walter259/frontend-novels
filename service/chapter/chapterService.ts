import { AppDispatch } from "@/store/store";

import api from "../api";
import { addChapter, removeChapter, setChapters, setCurrentChapter, setError, setLoading, updateChapter } from "@/store/slices/chapterSlice";

interface ChaptersResponse {
  message: string;
  chapters: Chapter[];
}

interface ChapterResponse {
  message: string;
  chapter: Chapter;
}

// Obtener todos los capítulos de una novela
export const getChaptersAsync = (novelId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    // Usando el endpoint correcto: /chapters/{novelId}
    const response = await api.get<ChaptersResponse>(`/chapters/${novelId}`);
    const chapters = response.data.chapters;
    dispatch(setChapters(chapters));
    return chapters;
  } catch (error) {
    dispatch(setError("Error fetching chapters"));
    console.error("Error fetching chapters:", error);
    throw error;
  }
};

// Obtener un capítulo específico
export const getChapterAsync = (novelId: number, chapterId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    // Usando el endpoint correcto: /novels/{novelId}/chapters/{id}
    const response = await api.get<ChapterResponse>(`/novels/${novelId}/chapters/${chapterId}`);
    const chapter = response.data.chapter;
    dispatch(setCurrentChapter(chapter));
    return chapter;
  } catch (error) {
    dispatch(setError("Error fetching chapter"));
    console.error("Error fetching chapter:", error);
    throw error;
  }
};

// Crear un nuevo capítulo
export const createChapterAsync = (
  novelId: number,
  chapterData: { title: string; content: string }
) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    // Si tienes un endpoint para crear capítulos, ajusta aquí
    // Por ahora mantengo la estructura genérica
    const response = await api.post<ChapterResponse>(
      `/novels/${novelId}/chapters/create`,
      chapterData
    );
    const chapter = response.data.chapter;
    dispatch(addChapter(chapter));
    return chapter;
  } catch (error) {
    dispatch(setError("Error creating chapter"));
    console.error("Error creating chapter:", error);
    throw error;
  }
};

// Actualizar un capítulo existente
export const updateChapterAsync = (
  novelId: number,
  chapterId: number, // Cambiado de chapterNumber a chapterId para ser consistente
  chapterData: { title?: string; content?: string; chapter_number?: number }
) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    // Usando el endpoint correcto: /novels/{novelId}/chapters/{id}
    const response = await api.patch<ChapterResponse>(
      `/novels/${novelId}/chapters/update/${chapterId}`,
      chapterData
    );
    const chapter = response.data.chapter;
    dispatch(updateChapter(chapter));
    return chapter;
  } catch (error) {
    dispatch(setError("Error updating chapter"));
    console.error("Error updating chapter:", error);
    throw error;
  }
};

// Eliminar un capítulo
export const deleteChapterAsync = (novelId: number, chapterId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
  
    await api.delete(`/novels/${novelId}/chapters/delete/${chapterId}`);
    dispatch(removeChapter(chapterId));
    return true;
  } catch (error) {
    dispatch(setError(`Error deleting chapter ${chapterId}`));
    console.error(`Error deleting chapter ${chapterId}:`, error);
    throw error;
  }
};