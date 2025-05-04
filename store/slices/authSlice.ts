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

// aqui elimine una interface usuario

interface Auth {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: Auth = {
  isAuthenticated:
    (getLocalStorage("isAuthenticated") === "true" ||
      getSessionStorageUtil("isAuthenticated") === "true") &&
    !!getCookie("token"),
  user:
    (getLocalStorage("user")
      ? JSON.parse(getLocalStorage("user") as string)
      : null) ||
    (getSessionStorageUtil("user")
      ? JSON.parse(getSessionStorageUtil("user") as string)
      : null) ||
    null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; remember: boolean }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;

      if (action.payload.remember) {
        setLocalStorage("isAuthenticated", "true");
        setLocalStorage("user", JSON.stringify(action.payload.user));
      } else {
        removeLocalStorage("isAuthenticated");
        removeLocalStorage("user");
        setSessionStorage("isAuthenticated", "true");
        setSessionStorage("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      removeSessionStorage("isAuthenticated");
      removeSessionStorage("user");
      removeCookie("token");
      removeLocalStorage("isAuthenticated");
      removeLocalStorage("user");
      removeLocalStorage("vite-ui-theme");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;