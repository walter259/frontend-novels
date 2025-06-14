import { AppDispatch, RootState } from "@/store/store";
import { 
  setFavorites, 
  addFavorite, 
  removeFavorite, 
  setLoading, 
  setError,
  clearFavorites,
  setCurrentUserId 
} from "@/store/slices/favoritesSlice";
import api from "../api";
import { AxiosError } from "axios";

interface FavoriteResponse {
  message: string;
  user_id: number;
  favorites: Favorite[];
}

interface AddFavoriteResponse {
  favorite: Favorite;
  message: string;
}

// Cache configuration
const userCacheMap = new Map<number, { lastFetchTime: number; favorites: Favorite[] }>();
const CACHE_DURATION = 30000; // Increased to 30 seconds to reduce API calls
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 seconds

// Request deduplication
const pendingRequests = new Map<number, Promise<Favorite[] | void>>();

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to validate user ID
const isValidUserId = (userId: number): number | boolean => {
  return userId && userId > 0 && Number.isInteger(userId);
};

// Obtener todos los favoritos del usuario
export const getFavoritesAsync = () => async (dispatch: AppDispatch, getState: () => RootState): Promise<Favorite[] | void> => {
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
  if (userCache && (now - userCache.lastFetchTime < CACHE_DURATION)) {
    dispatch(setFavorites(userCache.favorites));
    return userCache.favorites;
  }

  // Clear favorites if user changed
  if (state.favorites.lastUserId !== null && state.favorites.lastUserId !== userId) {
    dispatch(clearFavorites());
  }

  const fetchRequest = async (): Promise<Favorite[] | void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastError: any;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        dispatch(setLoading());
        dispatch(setCurrentUserId(userId));
        
        // Try different endpoints in order of preference
        const endpoints = [
          `/users/${userId}/favorites`,
          `/favorites?user_id=${userId}`,
          `/favorites`
        ];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let response: any;
        let endpointWorked = false;
        
        for (const endpoint of endpoints) {
          try {
            response = await api.get<FavoriteResponse>(endpoint);
            endpointWorked = true;
            break;
          } catch (endpointError) {
            if (endpointError instanceof AxiosError && endpointError.response?.status === 404) {
              continue; // Try next endpoint
            }
            throw endpointError; // Re-throw if it's not a 404
          }
        }
        
        if (!endpointWorked) {
          throw new Error("No working endpoint found for fetching favorites");
        }
        
        const favorites = response.data.favorites || [];
        
        // Update cache only on successful request
        userCacheMap.set(userId, {
          lastFetchTime: Date.now(),
          favorites: favorites
        });
        
        dispatch(setFavorites(favorites));
        return favorites;
        
      } catch (error) {
        lastError = error;
        
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          
          switch (status) {
            case 401:
              // Unauthorized - clear favorites and don't retry
              dispatch(clearFavorites());
              return;
              
            case 403:
              // Forbidden - don't retry
              dispatch(setError("Access denied to favorites"));
              throw error;
              
            case 429:
              // Rate limiting - wait longer before retry
              if (attempt < MAX_RETRIES - 1) {
                const waitTime = RETRY_DELAY * (attempt + 1); // Exponential backoff
                console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}`);
                await delay(waitTime);
                continue;
              }
              break;
              
            case 404:
              // Endpoint not found - this is handled above by trying multiple endpoints
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
          const errorMessage = error instanceof AxiosError 
            ? `Error fetching favorites (${error.response?.status}): ${error.response?.data?.message || error.message}`
            : "Error fetching favorites";
          
          dispatch(setError(errorMessage));
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

// Añadir una novela a favoritos
export const addFavoriteAsync = (novelId: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const response = await api.post<AddFavoriteResponse>(`/novels/${novelId}/favorites`);
    const favorite = response.data.favorite;
    dispatch(addFavorite(favorite));
    return favorite;
  } catch (error) {
    dispatch(setError("Error adding favorite"));
    console.error("Error adding favorite:", error);
    throw error;
  }
};

// Eliminar una novela de favoritos
export const removeFavoriteAsync = (favoriteId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
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

  try {
    dispatch(setLoading());
    await api.delete(`/favorites/${favoriteId}`);
    dispatch(removeFavorite(favoriteId));
    
    // Update cache
    const userCache = userCacheMap.get(userId);
    if (userCache) {
      userCache.favorites = userCache.favorites.filter(fav => fav.id !== favoriteId);
      userCache.lastFetchTime = Date.now();
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof AxiosError 
      ? `Error removing favorite (${error.response?.status}): ${error.response?.data?.message || error.message}`
      : `Error removing favorite ${favoriteId}`;
    
    dispatch(setError(errorMessage));
    console.error(`Error removing favorite ${favoriteId}:`, error);
    throw error;
  }
};

// Check if user has a specific favorite
export const checkIsFavorite = (novelId: number) => (getState: () => RootState): boolean => {
  const state = getState();
  return state.favorites.favorites.some(fav => fav.novel_id === novelId);
};

// Get favorite by novel ID
export const getFavoriteByNovelId = (novelId: number) => (getState: () => RootState): Favorite | undefined => {
  const state = getState();
  return state.favorites.favorites.find(fav => fav.novel_id === novelId);
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
      isExpired: Date.now() - cache.lastFetchTime > CACHE_DURATION
    }))
  };
};