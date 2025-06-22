"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "../ui/sidebar";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import FavoritesProvider from "./FavoritesProvider";

interface Props {
  children: React.ReactNode;
}
export default function Providers({ children }: Props) {
  const queryClient = new QueryClient();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </FavoritesProvider>
      </QueryClientProvider>
    </Provider>
  );
}
