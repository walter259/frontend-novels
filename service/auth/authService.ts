// service/auth/authService.ts
import { store } from "@/store/store";
import { login, logout } from "@/store/slices/authSlice";
import { clearAllCache } from "../favorites/favoritesService";
import { setCookie } from "@/lib/utils/cookies";
import api from "../api";
import { ResetPasswordSchema } from "@/lib/validators/reset-password";
import { z } from "zod";
import { RegisterSchema } from "@/lib/validators/register";
import { changePasswordSchema } from "@/lib/validators/change-password";
import { clearFavorites } from "@/store/slices/favoritesSlice";

interface LoginResponse {
  message: string;
  user: User;
  token: string;
  type: string;
}

export const loginUser = async (
  identifier: string,
  password: string,
  remember: boolean = false
) => {
  const payload = identifier.includes("@")
    ? { email: identifier, password }
    : { user: identifier, password };

  const response = await api.post<LoginResponse>("/auth/login", payload);
  const { token, user } = response.data;
  
  setCookie("token", token, 1);
  
  // NUEVO: Limpiar favoritos antes de hacer login
  store.dispatch(clearFavorites());
  
  store.dispatch(login({ user, remember }));
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.warn("Error during logout API call:", error);
  } finally {
    // NUEVO: Limpiar favoritos y caché al hacer logout
    store.dispatch(clearFavorites());
    clearAllCache();
    store.dispatch(logout());
  }
};

export const registerUser = async (data: z.infer<typeof RegisterSchema>) => {
  const response = await api.post("/auth/register", data);
  const { token, user } = response.data;
  setCookie("token", token, 1);
  store.dispatch(login({ user, remember: true }));
  return response.data;
};

export const requestResetLink = async (email: string) => {
  const response = await api.post("/auth/password/reset", { email });
  return response.data;
};

export const updatePassword = async (
  data: z.infer<typeof ResetPasswordSchema>
) => {
  const response = await api.post("/auth/password/update", data);
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get<{ user: User }>("/user");
    const user = response.data.user;
    console.log("getCurrentUser response:", user); // Depuración
    store.dispatch(login({ user, remember: true }));
    return user;
  } catch (error) {
    console.log("Error fetching current user:", error);
    return null;
  }
};

export const changePassword = async (data: z.infer<typeof changePasswordSchema>) => {
  const payload = {
    current_password: data.current_password,
    new_password: data.new_password,
    new_password_confirmation: data.new_password_confirmation, // Ajustado a new_password_confirmation
  };
  const response = await api.post("/auth/password/change", payload);
  return response.data;
};
