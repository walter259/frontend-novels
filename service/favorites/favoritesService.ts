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

// Cache configuration
const userCacheMap = new Map<
  number,
  { lastFetchTime: number; favorites: Favorite[] }
>();
const CACHE_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 seconds

// Request deduplication
const pendingRequests = new Map<number, Promise<Favorite[] | void>>();

// Helper function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to validate user ID
const isValidUserId = (userId: number) => {
  return userId && userId > 0 && Number.isInteger(userId);
};

// Helper function to invalidate cache
const invalidateUserCache = (userId: number) => {
  userCacheMap.delete(userId);
};

// Helper function to create operation key
const createOperationKey = (userId: number, novelId: number, operation: string) => {
  return `${userId}-${novelId}-${operation}`;
};

// Obtener favoritos del usuario autenticado
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

    // Validate user ID
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

          // Use the specific user favorites endpoint
          const response = await api.get<FavoriteResponse>(`/users/${userId}/favorites`);

          const favorites = response.data.favorites || [];

          // Update cache only on successful request
          userCacheMap.set(userId, {
            lastFetchTime: Date.now(),
            favorites: favorites,
          });

          dispatch(setFavorites(favorites));
          dispatch(clearLoading());
          return favorites;
        } catch (error) {
          lastError = error;

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
                // Unauthorized - clear favorites and don't retry
                dispatch(clearFavorites());
                dispatch(clearLoading());
                return;

              case 403:
                // Forbidden - don't retry
                dispatch(setError("Access denied to favorites"));
                dispatch(clearLoading());
                throw error;

              case 404:
                // No favorites found - set empty array
                dispatch(setFavorites([]));
                userCacheMap.set(userId, {
                  lastFetchTime: Date.now(),
                  favorites: [],
                });
                dispatch(clearLoading());
                return [];

              case 429:
                // Rate limiting - wait longer before retry
                if (attempt < MAX_RETRIES - 1) {
                  const waitTime = RETRY_DELAY * (attempt + 1);
                  console.log(
                    `Rate limited. Waiting ${waitTime}ms before retry ${
                      attempt + 1
                    }`
                  );
                  await delay(waitTime);
                  continue;
                }
                break;

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
                ? `Error fetching favorites (${error.response?.status}): ${
                    error.response?.data?.message || error.message
                  }`
                : "Error fetching favorites";

            dispatch(setError(errorMessage));
            dispatch(clearLoading());
            console.error("Error fetching favorites:", error);
            throw error;
          }
        }
      }

      // This shouldn't be reached, but just in case
      throw lastError;
    };

    // Add to pending requests
    const promise = fetchRequest().finally(() => {
      pendingRequests.delete(userId);
    });

    pendingRequests.set(userId, promise);
    return promise;
  };

// Obtener favoritos de un usuario específico por ID
export const getFavoritesByUserIdAsync =
  (userId: number) =>
  async (dispatch: AppDispatch): Promise<Favorite[] | void> => {
    if (!isValidUserId(userId)) {
      dispatch(setError("Invalid user ID"));
      return;
    }

    const now = Date.now();

    // Check cache
    const userCache = userCacheMap.get(userId);
    if (userCache && now - userCache.lastFetchTime < CACHE_DURATION) {
      return userCache.favorites;
    }

    const fetchRequest = async (): Promise<Favorite[] | void> => {
      let lastError: any;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Use the specific user favorites endpoint
          const response = await api.get<FavoriteResponse>(`/users/${userId}/favorites`);

          const favorites = response.data.favorites || [];

          // Update cache only on successful request
          userCacheMap.set(userId, {
            lastFetchTime: Date.now(),
            favorites: favorites,
          });

          return favorites;
        } catch (error) {
          lastError = error;

          if (error instanceof AxiosError) {
            const status = error.response?.status;

            switch (status) {
              case 401:
              case 403:
                // Unauthorized/Forbidden - don't retry
                throw error;

              case 404:
                // User not found or no favorites
                return [];

              case 429:
                // Rate limiting - wait longer before retry
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
            console.error("Error fetching favorites by user ID:", error);
            throw error;
          }
        }
      }

      throw lastError;
    };

    return fetchRequest();
  };

// Añadir una novela a favoritos (simplificado)
export const addFavoriteAsync = (novelId: number) => 
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

    const operationKey = createOperationKey(userId, novelId, 'add');

    try {
      dispatch(setOperationLoading({ operation: operationKey, loading: true }));
      
      const response = await api.post<AddFavoriteResponse>(
        `/users/${userId}/novels/${novelId}/favorites`
      );
      const favorite = response.data.favorite;
      
      dispatch(addFavorite(favorite));
      
      // Invalidate cache to ensure consistency
      invalidateUserCache(userId);
      
      dispatch(setOperationLoading({ operation: operationKey, loading: false }));
      return favorite;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        // Conflict - item might already be favorited
        console.log('Favorite already exists (409 conflict)');
        dispatch(setOperationLoading({ operation: operationKey, loading: false }));
        return;
      }

      const errorMessage =
        error instanceof AxiosError
          ? `Error adding favorite (${error.response?.status}): ${
              error.response?.data?.message || error.message
            }`
          : "Error adding favorite";

      dispatch(setError(errorMessage));
      dispatch(setOperationLoading({ operation: operationKey, loading: false }));
      console.error("Error adding favorite:", error);
      throw error;
    }
  };

// Eliminar una novela de favoritos (simplificado)
export const removeFavoriteAsync = (favoriteId: number) => 
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

    // Find the favorite to get the novel ID
    const favorite = state.favorites.favorites.find(fav => fav.id === favoriteId);
    if (!favorite) {
      dispatch(setError("Favorite not found"));
      return;
    }

    const operationKey = createOperationKey(userId, favorite.novel_id, 'remove');

    try {
      dispatch(setOperationLoading({ operation: operationKey, loading: true }));
      
      await api.delete(`/users/${userId}/novels/${favorite.novel_id}/favorites`);

      dispatch(removeFavorite(favoriteId));
      
      // Invalidate cache to ensure consistency
      invalidateUserCache(userId);

      dispatch(setOperationLoading({ operation: operationKey, loading: false }));
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        // Not found - might already be removed
        console.log('Favorite not found (404) - might already be removed');
        dispatch(removeFavorite(favoriteId)); // Remove from state anyway
        dispatch(setOperationLoading({ operation: operationKey, loading: false }));
        return true;
      }

      const errorMessage =
        error instanceof AxiosError
          ? `Error removing favorite (${error.response?.status}): ${
              error.response?.data?.message || error.message
            }`
          : "Error removing favorite";

      dispatch(setError(errorMessage));
      dispatch(setOperationLoading({ operation: operationKey, loading: false }));
      console.error("Error removing favorite:", error);
      throw error;
    }
  };

// Check if user has a specific favorite
export const checkIsFavorite =
  (novelId: number) =>
  (getState: () => RootState): boolean => {
    const state = getState();
    return state.favorites.favorites.some((fav) => fav.novel_id === novelId);
  };

// Get favorite by novel ID
export const getFavoriteByNovelId =
  (novelId: number) =>
  (getState: () => RootState): Favorite | undefined => {
    const state = getState();
    return state.favorites.favorites.find((fav) => fav.novel_id === novelId);
  };

// Limpiar caché de un usuario específico
export const clearUserCache = (userId: number) => {
  userCacheMap.delete(userId);
  pendingRequests.delete(userId);
};

// Limpiar todo el caché
export const clearAllCache = () => {
  userCacheMap.clear();
  pendingRequests.clear();
};

// Get cache info for debugging
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