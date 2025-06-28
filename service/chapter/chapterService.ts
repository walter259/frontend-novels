import { AppDispatch } from "@/store/store";
import { AxiosError } from "axios";

import api from "../api";
import {
  addChapter,
  removeChapter,
  setChapters,
  setCurrentChapter,
  setError,
  setLoading,
  updateChapter,
} from "@/store/slices/chapterSlice";

interface ChaptersResponse {
  message: string;
  chapters: Chapter[];
}

interface ChapterResponse {
  message: string;
  chapter: Chapter;
}

// Cache configuration
const novelCacheMap = new Map<
  number,
  { lastFetchTime: number; chapters: Chapter[] }
>();
const chapterCacheMap = new Map<
  string,
  { lastFetchTime: number; chapter: Chapter }
>();
const CACHE_DURATION = 30000; // 30 seconds cache
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 seconds

// Request deduplication
const pendingChapterRequests = new Map<string, Promise<Chapter | void>>();
const pendingChaptersRequests = new Map<number, Promise<Chapter[] | void>>();

// Helper function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to create cache key for individual chapter
const getChapterCacheKey = (novelId: number, chapterId: number) =>
  `chapter_${novelId}_${chapterId}`;

// Obtener todos los capítulos de una novela
export const getChaptersAsync =
  (novelId: number) =>
  async (dispatch: AppDispatch): Promise<Chapter[] | void> => {
    const now = Date.now();

    // Check for pending request
    if (pendingChaptersRequests.has(novelId)) {
      return pendingChaptersRequests.get(novelId);
    }

    // Check cache
    const novelCache = novelCacheMap.get(novelId);
    if (novelCache && now - novelCache.lastFetchTime < CACHE_DURATION) {
      dispatch(setChapters(novelCache.chapters));
      return novelCache.chapters;
    }

    const fetchRequest = async (): Promise<Chapter[] | void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lastError: any;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          dispatch(setLoading());
          // Usando el endpoint correcto: /chapters/{novelId}
          const response = await api.get<ChaptersResponse>(
            `/chapters/${novelId}`
          );
          const chapters = response.data.chapters;

          // Update cache only on successful request
          novelCacheMap.set(novelId, {
            lastFetchTime: Date.now(),
            chapters: chapters,
          });

          dispatch(setChapters(chapters));
          return chapters;
        } catch (error) {
          lastError = error;

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
                // Unauthorized - don't retry
                dispatch(
                  setError("No autorizado para acceder a los capítulos")
                );
                throw error;

              case 403:
                // Forbidden - don't retry
                dispatch(setError("Acceso denegado a los capítulos"));
                throw error;

              case 429:
                // Rate limiting - wait longer before retry
                if (attempt < MAX_RETRIES - 1) {
                  const waitTime = RETRY_DELAY * (attempt + 1); // Exponential backoff
                  await delay(waitTime);
                  continue;
                }
                break;

              case 404:
                // Not found - don't retry
                dispatch(setError("Novela no encontrada"));
                throw error;

              case 500:
              case 502:
              case 503:
              case 504:
                // Server errors - retry with delay
                if (attempt < MAX_RETRIES - 1) {
                  await delay(RETRY_DELAY);
                  continue;
                }
                break;
            }
          }

          // If this is the last attempt, throw the error
          if (attempt === MAX_RETRIES - 1) {
            const errorMessage =
              error instanceof AxiosError
                ? `Error fetching chapters (${error.response?.status}): ${
                    error.response?.data?.message || error.message
                  }`
                : "Error fetching chapters";

            dispatch(setError(errorMessage));
            console.error("Error fetching chapters:", error);
            throw error;
          }
        }
      }

      // This shouldn't be reached, but just in case
      throw lastError;
    };

    // Add to pending requests
    const promise = fetchRequest().finally(() => {
      pendingChaptersRequests.delete(novelId);
    });

    pendingChaptersRequests.set(novelId, promise);
    return promise;
  };

// Obtener un capítulo específico
export const getChapterAsync =
  (novelId: number, chapterId: number) =>
  async (dispatch: AppDispatch): Promise<Chapter | void> => {
    const cacheKey = getChapterCacheKey(novelId, chapterId);
    const now = Date.now();

    // Check for pending request
    if (pendingChapterRequests.has(cacheKey)) {
      return pendingChapterRequests.get(cacheKey);
    }

    // Check cache
    const chapterCache = chapterCacheMap.get(cacheKey);
    if (chapterCache && now - chapterCache.lastFetchTime < CACHE_DURATION) {
      dispatch(setCurrentChapter(chapterCache.chapter));
      return chapterCache.chapter;
    }

    const fetchRequest = async (): Promise<Chapter | void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lastError: any;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          dispatch(setLoading());
          // Usando el endpoint correcto: /novels/{novelId}/chapters/{id}
          const response = await api.get<ChapterResponse>(
            `/novels/${novelId}/chapters/${chapterId}`
          );
          const chapter = response.data.chapter;

          // Update cache only on successful request
          chapterCacheMap.set(cacheKey, {
            lastFetchTime: Date.now(),
            chapter: chapter,
          });

          dispatch(setCurrentChapter(chapter));
          return chapter;
        } catch (error) {
          lastError = error;

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
                // Unauthorized - don't retry
                dispatch(setError("No autorizado para acceder al capítulo"));
                throw error;

              case 403:
                // Forbidden - don't retry
                dispatch(setError("Acceso denegado al capítulo"));
                throw error;

              case 429:
                // Rate limiting - wait longer before retry
                if (attempt < MAX_RETRIES - 1) {
                  const waitTime = RETRY_DELAY * (attempt + 1); // Exponential backoff
                  await delay(waitTime);
                  continue;
                }
                break;

              case 404:
                // Not found - don't retry
                dispatch(setError("Capítulo no encontrado"));
                throw error;

              case 500:
              case 502:
              case 503:
              case 504:
                // Server errors - retry with delay
                if (attempt < MAX_RETRIES - 1) {
                  await delay(RETRY_DELAY);
                  continue;
                }
                break;
            }
          }

          // If this is the last attempt, throw the error
          if (attempt === MAX_RETRIES - 1) {
            const errorMessage =
              error instanceof AxiosError
                ? `Error fetching chapter (${error.response?.status}): ${
                    error.response?.data?.message || error.message
                  }`
                : "Error fetching chapter";

            dispatch(setError(errorMessage));
            console.error("Error fetching chapter:", error);
            throw error;
          }
        }
      }

      // This shouldn't be reached, but just in case
      throw lastError;
    };

    // Add to pending requests
    const promise = fetchRequest().finally(() => {
      pendingChapterRequests.delete(cacheKey);
    });

    pendingChapterRequests.set(cacheKey, promise);
    return promise;
  };

// Crear un nuevo capítulo
export const createChapterAsync =
  (novelId: number, chapterData: { title: string; content: string }) =>
  async (dispatch: AppDispatch) => {
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
export const updateChapterAsync =
  (
    novelId: number,
    chapterId: number, // Cambiado de chapterNumber a chapterId para ser consistente
    chapterData: { title?: string; content?: string; chapter_number?: number }
  ) =>
  async (dispatch: AppDispatch) => {
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
export const deleteChapterAsync =
  (novelId: number, chapterId: number) => async (dispatch: AppDispatch) => {
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

// Limpiar caché de una novela específica
export const clearNovelCache = (novelId: number) => {
  novelCacheMap.delete(novelId);
  pendingChaptersRequests.delete(novelId);

  // También limpiar todos los capítulos de esta novela
  const chapterKeysToDelete: string[] = [];
  for (const [key] of chapterCacheMap) {
    if (key.startsWith(`chapter_${novelId}_`)) {
      chapterKeysToDelete.push(key);
    }
  }
  chapterKeysToDelete.forEach((key) => {
    chapterCacheMap.delete(key);
    pendingChapterRequests.delete(key);
  });
};

// Limpiar caché de un capítulo específico
export const clearChapterCache = (novelId: number, chapterId: number) => {
  const cacheKey = getChapterCacheKey(novelId, chapterId);
  chapterCacheMap.delete(cacheKey);
  pendingChapterRequests.delete(cacheKey);
};

// Limpiar todo el caché
export const clearAllChapterCache = () => {
  novelCacheMap.clear();
  chapterCacheMap.clear();
  pendingChaptersRequests.clear();
  pendingChapterRequests.clear();
};

// Get cache info for debugging
export const getChapterCacheInfo = () => {
  return {
    novelCacheSize: novelCacheMap.size,
    chapterCacheSize: chapterCacheMap.size,
    pendingChaptersRequests: pendingChaptersRequests.size,
    pendingChapterRequests: pendingChapterRequests.size,
    novelCacheEntries: Array.from(novelCacheMap.entries()).map(
      ([novelId, cache]) => ({
        novelId,
        chaptersCount: cache.chapters.length,
        cacheAge: Date.now() - cache.lastFetchTime,
        isExpired: Date.now() - cache.lastFetchTime > CACHE_DURATION,
      })
    ),
    chapterCacheEntries: Array.from(chapterCacheMap.entries()).map(
      ([key, cache]) => ({
        key,
        cacheAge: Date.now() - cache.lastFetchTime,
        isExpired: Date.now() - cache.lastFetchTime > CACHE_DURATION,
      })
    ),
  };
};
