"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "../ui/sidebar";
import { Provider } from "react-redux";
import { store } from "@/store/store";

interface Props {
  children: React.ReactNode;
}
export default function Providers({ children }: Props) {
  const queryClient = new QueryClient();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>{children}</SidebarProvider>
      </QueryClientProvider>
    </Provider>
  );
}
