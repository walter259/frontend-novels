// service/favorites/favoritesService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDispatch, RootState } from "@/store/store";
import {
  setFavorites,
  addFavorite,
  removeFavorite,
  setLoading,
  setError,
  clearFavorites,
  setCurrentUserId,
  clearLoading,
  setOperationLoading,
} from "@/store/slices/favoritesSlice";
import api from "../api";
import { AxiosError } from "axios";

interface FavoriteResponse {
  message: string;
  user_id?: number;
  favorites: Favorite[];
}

interface AddFavoriteResponse {
  favorite: Favorite;
  message: string;
}

// Cache configuration (solo para getFavorites)
const userCacheMap = new Map<
  number,
  { lastFetchTime: number; favorites: Favorite[] }
>();
const CACHE_DURATION = 60000; // 60 segundos
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000;

// Request deduplication (solo para getFavorites)
const pendingRequests = new Map<number, Promise<Favorite[] | void>>();

// Helper functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidUserId = (userId: number) => {
  return userId && userId > 0 && Number.isInteger(userId);
};

const createOperationKey = (
  userId: number,
  novelId: number,
  operation: string
) => {
  return `${userId}-${novelId}-${operation}`;
};

// Obtener favoritos del usuario autenticado (SIN cambios)
export const getFavoritesAsync =
  () =>
  async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<Favorite[] | void> => {
    const state = getState();
    const currentUser = state.auth.user;

    if (!currentUser || !currentUser.id) {
      dispatch(clearFavorites());
      return;
    }

    const userId = currentUser.id;

    if (!isValidUserId(userId)) {
      dispatch(setError("Invalid user ID"));
      dispatch(clearFavorites());
      return;
    }

    const now = Date.now();

    // Check for pending request
    if (pendingRequests.has(userId)) {
      return pendingRequests.get(userId);
    }

    // Check cache
    const userCache = userCacheMap.get(userId);
    if (userCache && now - userCache.lastFetchTime < CACHE_DURATION) {
      dispatch(setFavorites(userCache.favorites));
      return userCache.favorites;
    }

    // Clear favorites if user changed
    if (
      state.favorites.lastUserId !== null &&
      state.favorites.lastUserId !== userId
    ) {
      dispatch(clearFavorites());
    }

    const fetchRequest = async (): Promise<Favorite[] | void> => {
      let lastError: any;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          dispatch(setLoading());
          dispatch(setCurrentUserId(userId));

          const response = await api.get<FavoriteResponse>(
            `/users/${userId}/favorites`
          );
          const favorites = response.data.favorites || [];

          // Update cache
          userCacheMap.set(userId, {
            lastFetchTime: Date.now(),
            favorites: favorites,
          });

          dispatch(setFavorites(favorites));
          dispatch(clearLoading());
          return favorites;
        } catch (error) {
          lastError = error;
          console.error(
            `❌ Error fetching favorites (attempt ${attempt + 1}):`,
            error
          );

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
                dispatch(clearFavorites());
                dispatch(clearLoading());
                return;

              case 403:
                dispatch(setError("Access denied to favorites"));
                dispatch(clearLoading());
                throw error;

              case 404:
                dispatch(setFavorites([]));
                userCacheMap.set(userId, {
                  lastFetchTime: Date.now(),
                  favorites: [],
                });
                dispatch(clearLoading());
                return [];

              case 429:
                if (attempt < MAX_RETRIES - 1) {
                  const waitTime = RETRY_DELAY * (attempt + 1);
                  await delay(waitTime);
                  continue;
                }
                break;

              case 500:
              case 502:
              case 503:
              case 504:
                if (attempt < MAX_RETRIES - 1) {
                  await delay(RETRY_DELAY);
                  continue;
                }
                break;
            }
          }

          if (attempt === MAX_RETRIES - 1) {
            const errorMessage =
              error instanceof AxiosError
                ? `Error fetching favorites (${error.response?.status}): ${
                    error.response?.data?.message || error.message
                  }`
                : "Error fetching favorites";

            dispatch(setError(errorMessage));
            dispatch(clearLoading());
            throw error;
          }
        }
      }

      throw lastError;
    };

    const promise = fetchRequest().finally(() => {
      pendingRequests.delete(userId);
    });

    pendingRequests.set(userId, promise);
    return promise;
  };

// Añadir una novela a favoritos (ARREGLADO - sin verificación prematura)
export const addFavoriteAsync =
  (novel: Novel) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const currentUser = state.auth.user;

    if (!currentUser || !currentUser.id) {
      dispatch(setError("User not authenticated"));
      return;
    }

    const userId = currentUser.id;

    if (!isValidUserId(userId)) {
      dispatch(setError("Invalid user ID"));
      return;
    }

    const operationKey = createOperationKey(userId, novel.id, "add");

    // Actualización optimista: si no existe, añadir localmente antes de la petición
    let optimisticallyAdded = false;
    let tempFavorite: Favorite | undefined = undefined;
    const alreadyExists = state.favorites.favorites.some(
      (fav) => fav.novel_id === novel.id
    );
    if (!alreadyExists) {
      tempFavorite = {
        id: Date.now(), // id temporal
        novel_id: novel.id,
        user_id: userId,
        novel: novel, // Aquí va el objeto completo
        image: novel.image || "",
        // ...otros campos si necesitas
      } as unknown as Favorite;
      dispatch(addFavorite(tempFavorite));
      optimisticallyAdded = true;
    }

    try {
      dispatch(setOperationLoading({ operation: operationKey, loading: true }));
      const response = await api.post<AddFavoriteResponse>(
        `/users/${userId}/novels/${novel.id}/favorites`
      );
      const favorite = response.data.favorite;
      if (optimisticallyAdded && tempFavorite) {
        dispatch(removeFavorite(tempFavorite.id));
        dispatch(addFavorite(favorite));
      } else {
        dispatch(addFavorite(favorite));
      }
      // Actualiza el cache si aplica
      const userCache = userCacheMap.get(userId);
      if (userCache) {
        const existsInCache = userCache.favorites.some(
          (fav) => fav.novel_id === novel.id
        );
        if (!existsInCache) {
          userCache.favorites = [...userCache.favorites, favorite];
        }
      }
      dispatch(
        setOperationLoading({ operation: operationKey, loading: false })
      );
      return favorite;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        if (optimisticallyAdded) {
          dispatch(
            setOperationLoading({ operation: operationKey, loading: false })
          );
          return;
        } else {
          dispatch(getFavoritesAsync());
          dispatch(
            setOperationLoading({ operation: operationKey, loading: false })
          );
          return;
        }
      }
      if (optimisticallyAdded && tempFavorite) {
        const currentState = getState();
        const temp = currentState.favorites.favorites.find(
          (fav) => fav.novel_id === novel.id && fav.id === tempFavorite!.id
        );
        if (temp) {
          dispatch(removeFavorite(temp.id));
        }
      }
      const errorMessage =
        error instanceof AxiosError
          ? `Error adding favorite (${error.response?.status}): ${
              error.response?.data?.message || error.message
            }`
          : "Error adding favorite";
      dispatch(setError(errorMessage));
      dispatch(
        setOperationLoading({ operation: operationKey, loading: false })
      );
      throw error;
    }
  };

// Eliminar favorito - ARREGLADO CON CACHE UPDATE
export const removeFavoriteAsync =
  (favoriteId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const currentUser = state.auth.user;

    if (!currentUser || !currentUser.id) {
      dispatch(setError("User not authenticated"));
      return;
    }

    const userId = currentUser.id;

    if (!isValidUserId(userId)) {
      dispatch(setError("Invalid user ID"));
      return;
    }

    const favorite = state.favorites.favorites.find(
      (fav) => fav.id === favoriteId
    );
    if (!favorite) {
      return;
    }

    const operationKey = createOperationKey(
      userId,
      favorite.novel_id,
      "remove"
    );

    try {
      dispatch(setOperationLoading({ operation: operationKey, loading: true }));

      await api.delete(
        `/users/${userId}/novels/${favorite.novel_id}/favorites`
      );

      // ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
      dispatch(removeFavorite(favoriteId));

      // ACTUALIZAR CACHE TAMBIÉN
      const userCache = userCacheMap.get(userId);
      if (userCache) {
        userCache.favorites = userCache.favorites.filter(
          (fav) => fav.id !== favoriteId
        );
      }

      // TERMINAR LA OPERACIÓN
      dispatch(
        setOperationLoading({ operation: operationKey, loading: false })
      );

      return true;
    } catch (error) {
      console.error(`❌ Error removing favorite:`, error);

      if (error instanceof AxiosError && error.response?.status === 404) {
        dispatch(removeFavorite(favoriteId));

        // ACTUALIZAR CACHE TAMBIÉN en caso 404
        const userCache = userCacheMap.get(userId);
        if (userCache) {
          userCache.favorites = userCache.favorites.filter(
            (fav) => fav.id !== favoriteId
          );
        }

        dispatch(
          setOperationLoading({ operation: operationKey, loading: false })
        );
        return true;
      }

      const errorMessage =
        error instanceof AxiosError
          ? `Error removing favorite (${error.response?.status}): ${
              error.response?.data?.message || error.message
            }`
          : "Error removing favorite";

      dispatch(setError(errorMessage));
      dispatch(
        setOperationLoading({ operation: operationKey, loading: false })
      );

      throw error;
    }
  };

// Resto de funciones sin cambios...
export const getFavoritesByUserIdAsync =
  (userId: number) =>
  async (dispatch: AppDispatch): Promise<Favorite[] | void> => {
    if (!isValidUserId(userId)) {
      dispatch(setError("Invalid user ID"));
      return;
    }

    try {
      const response = await api.get<FavoriteResponse>(
        `/users/${userId}/favorites`
      );
      const favorites = response.data.favorites || [];
      return favorites;
    } catch (error) {
      console.error("Error fetching favorites by user ID:", error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  };

export const checkIsFavorite =
  (novelId: number) =>
  (getState: () => RootState): boolean => {
    const state = getState();
    return state.favorites.favorites.some((fav) => fav.novel_id === novelId);
  };

export const getFavoriteByNovelId =
  (novelId: number) =>
  (getState: () => RootState): Favorite | undefined => {
    const state = getState();
    return state.favorites.favorites.find((fav) => fav.novel_id === novelId);
  };

export const clearUserCache = (userId: number) => {
  userCacheMap.delete(userId);
  pendingRequests.delete(userId);
};

export const clearAllCache = () => {
  userCacheMap.clear();
  pendingRequests.clear();
};

export const getCacheInfo = () => {
  return {
    cacheSize: userCacheMap.size,
    pendingRequests: pendingRequests.size,
    cacheEntries: Array.from(userCacheMap.entries()).map(([userId, cache]) => ({
      userId,
      favoritesCount: cache.favorites.length,
      cacheAge: Date.now() - cache.lastFetchTime,
      isExpired: Date.now() - cache.lastFetchTime > CACHE_DURATION,
    })),
  };
};
