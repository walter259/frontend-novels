import { Home, Package, Folder } from "lucide-react";
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
        title: "Explorar",
        link: "/product",
        icon: Package, 
      },
      {
        id: 3,
        title: "Categorias",
        link: "/category",
        icon: Folder,
      },

      {
        id: 4,
        title: "Biblioteca",
        link: "/category",
        icon: Folder,
      },
  ],[]);

  return {
    routes,
  };
}
