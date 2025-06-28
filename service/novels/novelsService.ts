import {
  addNovel,
  removeNovel,
  setError,
  setLoading,
  setNovels,
  updateNovels,
} from "@/store/slices/novelsSlice";
import api from "../api";
import { AppDispatch } from "@/store/store";
import { AxiosError } from "axios";

interface NovelsResponse {
  novels: Novel[];
}

interface NovelResponse {
  novel: Novel;
}

interface CreateNovelData {
  title: string;
  description: string;
  category_id: number;
  image?: File;
}

interface UpdateNovelData {
  title?: string;
  description?: string;
  category_id?: number;
  image?: File;
}

// Cache configuration
const novelCacheMap = new Map<
  string,
  { lastFetchTime: number; novel: Novel }
>();
const novelsListCacheMap = new Map<
  string,
  { lastFetchTime: number; novels: Novel[] }
>();
const CACHE_DURATION = 30000; // 30 seconds cache
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 seconds

// Request deduplication
const pendingNovelRequests = new Map<string, Promise<Novel | void>>();
const pendingNovelsListRequests = new Map<string, Promise<Novel[] | void>>();

// Helper function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getNovelsAsync =
  () =>
  async (dispatch: AppDispatch): Promise<Novel[] | void> => {
    const cacheKey = "all_novels";
    const now = Date.now();

    // Check for pending request
    if (pendingNovelsListRequests.has(cacheKey)) {
      return pendingNovelsListRequests.get(cacheKey);
    }

    // Check cache
    const novelsCache = novelsListCacheMap.get(cacheKey);
    if (novelsCache && now - novelsCache.lastFetchTime < CACHE_DURATION) {
      dispatch(setNovels(novelsCache.novels));
      return novelsCache.novels;
    }

    const fetchRequest = async (): Promise<Novel[] | void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lastError: any;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          dispatch(setLoading());
          const response = await api.get<NovelsResponse>("/novels");
          const novels = response.data.novels;

          // Update cache only on successful request
          novelsListCacheMap.set(cacheKey, {
            lastFetchTime: Date.now(),
            novels: novels,
          });

          dispatch(setNovels(novels));
          return novels;
        } catch (error) {
          lastError = error;

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
                // Unauthorized - don't retry
                dispatch(setError("No autorizado para acceder a las novelas"));
                throw error;

              case 403:
                // Forbidden - don't retry
                dispatch(setError("Acceso denegado a las novelas"));
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
                dispatch(setError("Novelas no encontradas"));
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
                ? `Error fetching novels (${error.response?.status}): ${
                    error.response?.data?.message || error.message
                  }`
                : "Error fetching novels";

            dispatch(setError(errorMessage));
            console.error("Error fetching novels:", error);
            throw error;
          }
        }
      }

      // This shouldn't be reached, but just in case
      throw lastError;
    };

    // Add to pending requests
    const promise = fetchRequest().finally(() => {
      pendingNovelsListRequests.delete(cacheKey);
    });

    pendingNovelsListRequests.set(cacheKey, promise);
    return promise;
  };

export const createNovelAsync =
  (data: CreateNovelData) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading());
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category_id", data.category_id.toString());
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await api.post<NovelResponse>(
        "/novels/create",
        formData
      );

      const novel = response.data.novel;

      dispatch(addNovel(novel));
      return novel;
    } catch (error) {
      dispatch(setError("Error creating novel"));
      console.error("Error creating novel:", error);
      throw error;
    }
  };

export const updateNovelAsync =
  (id: string, data: UpdateNovelData) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading());
      const formData = new FormData();

      // Solo agregar campos que realmente se van a actualizar
      if (data.title !== undefined) formData.append("title", data.title);
      if (data.description !== undefined)
        formData.append("description", data.description);
      if (data.category_id !== undefined)
        formData.append("category_id", data.category_id.toString());
      if (data.image) formData.append("image", data.image);

      // Cambié PUT por PATCH y ajusté la URL para coincidir con tu backend
      const response = await api.post<NovelResponse>(
        `/novels/update/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const novel = response.data.novel;
      dispatch(updateNovels(novel));
      return novel;
    } catch (error) {
      dispatch(setError(`Error updating novel ${id}`));
      console.error(`Error updating novel ${id}:`, error);
      throw error;
    }
  };

export const deleteNovelAsync =
  (id: number) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading());
      await api.delete(`/novels/delete/${id}`);
      dispatch(removeNovel(id));
    } catch (error) {
      dispatch(setError(`Error deleting novel ${id}`));
      console.error(`Error deleting novel ${id}:`, error);
      throw error;
    }
  };

export const getNovelByIdAsync =
  (id: string) =>
  async (dispatch: AppDispatch): Promise<Novel | void> => {
    const now = Date.now();

    // Check for pending request
    if (pendingNovelRequests.has(id)) {
      return pendingNovelRequests.get(id);
    }

    // Check cache
    const novelCache = novelCacheMap.get(id);
    if (novelCache && now - novelCache.lastFetchTime < CACHE_DURATION) {
      return novelCache.novel;
    }

    const fetchRequest = async (): Promise<Novel | void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let lastError: any;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          dispatch(setLoading());
          const response = await api.get<NovelResponse>(`/novels/${id}`);
          const novel = response.data.novel;

          // Update cache only on successful request
          novelCacheMap.set(id, {
            lastFetchTime: Date.now(),
            novel: novel,
          });

          return novel;
        } catch (error) {
          lastError = error;

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
                // Unauthorized - don't retry
                dispatch(setError("No autorizado para acceder a la novela"));
                throw error;

              case 403:
                // Forbidden - don't retry
                dispatch(setError("Acceso denegado a la novela"));
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
                ? `Error fetching novel (${error.response?.status}): ${
                    error.response?.data?.message || error.message
                  }`
                : "Error fetching novel";

            dispatch(setError(errorMessage));
            console.error(`Error fetching novel ${id}:`, error);
            throw error;
          }
        }
      }

      // This shouldn't be reached, but just in case
      throw lastError;
    };

    // Add to pending requests
    const promise = fetchRequest().finally(() => {
      pendingNovelRequests.delete(id);
    });

    pendingNovelRequests.set(id, promise);
    return promise;
  };

// Limpiar caché de una novela específica
export const clearNovelCache = (id: string) => {
  novelCacheMap.delete(id);
  pendingNovelRequests.delete(id);
};

// Limpiar todo el caché de novelas
export const clearAllNovelsCache = () => {
  novelCacheMap.clear();
  novelsListCacheMap.clear();
  pendingNovelRequests.clear();
  pendingNovelsListRequests.clear();
};

// Get cache info for debugging
export const getNovelsCacheInfo = () => {
  return {
    novelCacheSize: novelCacheMap.size,
    novelsListCacheSize: novelsListCacheMap.size,
    pendingNovelRequests: pendingNovelRequests.size,
    pendingNovelsListRequests: pendingNovelsListRequests.size,
    novelCacheEntries: Array.from(novelCacheMap.entries()).map(
      ([id, cache]) => ({
        id,
        cacheAge: Date.now() - cache.lastFetchTime,
        isExpired: Date.now() - cache.lastFetchTime > CACHE_DURATION,
      })
    ),
    novelsListCacheEntries: Array.from(novelsListCacheMap.entries()).map(
      ([key, cache]) => ({
        key,
        novelsCount: cache.novels.length,
        cacheAge: Date.now() - cache.lastFetchTime,
        isExpired: Date.now() - cache.lastFetchTime > CACHE_DURATION,
      })
    ),
  };
};
