// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
} from "@/lib/utils/localStorage";
import { getCookie } from "@/lib/utils/cookies";
import {
  getSessionStorage as getSessionStorageUtil,
  setSessionStorage,
  removeSessionStorage,
} from "@/lib/utils/sessionStorage";
import { removeCookie } from "@/lib/utils/cookies";

// Interfaz del estado de autenticación
interface Auth {
  user: User | null;         // Datos del usuario
  isAuthenticated: boolean; // Estado de autenticación
}

// Estado inicial basado en datos persistentes
const initialState: Auth = {
  isAuthenticated:
    (getLocalStorage("isAuthenticated") === "true" ||
      getSessionStorageUtil("isAuthenticated") === "true") &&
    !!getCookie("token"), // Solo si hay token en cookie
  user:
    (getLocalStorage("user")
      ? JSON.parse(getLocalStorage("user") as string)
      : null) ||
    (getSessionStorageUtil("user")
      ? JSON.parse(getSessionStorageUtil("user") as string)
      : null) ||
    null,  // Usuario desde almacenamiento
};

// Slice de autenticación
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Acción: iniciar sesión
    login: (state, action: PayloadAction<{ user: User; remember: boolean }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;

      if (action.payload.remember) {
        // Guardar en localStorage si el usuario quiere recordar sesión
        setLocalStorage("isAuthenticated", "true");
        setLocalStorage("user", JSON.stringify(action.payload.user));
      } else {
        // Guardar en sessionStorage (se borra al cerrar navegador)
        removeLocalStorage("isAuthenticated");
        removeLocalStorage("user");
        setSessionStorage("isAuthenticated", "true");
        setSessionStorage("user", JSON.stringify(action.payload.user));
      }
    },
     // Acción: cerrar sesión
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;

      // Limpiar almacenamiento y cookies
      removeSessionStorage("isAuthenticated");
      removeSessionStorage("user");
      removeCookie("token");
      removeLocalStorage("isAuthenticated");
      removeLocalStorage("user");
      removeLocalStorage("vite-ui-theme"); // Tema UI (opcional)
    },
  },
});

// Exportar acciones y reducer
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;