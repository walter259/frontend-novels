"use client";
import { getCookie } from "@/lib/utils/cookies";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export function useAuth() {
  const token = getCookie("token");
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) && !!token;
  const { user } = useSelector((state: RootState) => state.auth);
  return { isAuthenticated, user };
}