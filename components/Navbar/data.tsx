import { Home, LibraryBig } from "lucide-react";
import { useMemo } from "react";

export default function useNavigationData() {
  const routes = useMemo(() => [
    {
        id: 1,
        title: "Home",
        link: "/",
        icon: Home,
      },
      {
        id: 2,
        title: "Estantería",
        link: "/favorites",
        icon: LibraryBig,
      },
  ],[]);

  return {
    routes,
  };
}
