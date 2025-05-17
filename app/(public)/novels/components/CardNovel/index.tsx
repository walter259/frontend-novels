// components/CardNovel.tsx
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { addFavoriteAsync } from "@/service/favorites/favoritesService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CardNovelProps {
  novel: Novel;
}

export default function CardNovel({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { favorites, loading: favoritesLoading } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLocalFavorite, setIsLocalFavorite] = useState(false);
  
  // Efecto para sincronizar el estado local con el estado global de Redux
  useEffect(() => {
    if (isAuthenticated) {
      const favoriteExists = favorites.some((fav) => fav.novel_id === novel.id);
      setIsLocalFavorite(favoriteExists);
    } else {
      setIsLocalFavorite(false);
    }
  }, [favorites, novel.id, isAuthenticated]);

  const handleAddFavorite = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para añadir a favoritos", {
        position: "top-right",
      });
      router.push("/login");
      return;
    }

    // Verificar si ya está en favoritos
    if (isLocalFavorite) {
      return;
    }

    // Actualización optimista de la UI
    setIsLocalFavorite(true);
    
    dispatch(addFavoriteAsync(novel.id))
      .then(() => {
        toast.success("Novela añadida a la estantería", {
          position: "top-right",
        });
      })
      .catch((error) => {
        // Revertir el cambio optimista en caso de error
        setIsLocalFavorite(false);
        console.error("Failed to add favorite:", error);
        toast.error("Error al añadir a favoritos");
      });
  };

  const { title, description, image, category } = novel;

  return (
    <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 gap-4">
        <div className="flex-shrink-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={title || "Portada de novela sin título"}
            width={80}
            height={80}
            className="object-cover rounded-sm"
          />
        </div>

        <div className="flex-grow space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1" title={title || ""}>
            {title || "Sin título"}
          </h3>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link href="#" className="hover:underline">
              {category || "Sin categoría"}
            </Link>
          </div>

          <p className="text-sm line-clamp-2" title={description || ""}>
            {description || "Sin descripción"}
          </p>
        </div>

        <div className="hidden md:flex flex-col gap-2 justify-center ml-auto">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Haga clic para leer
          </Button>
          {isAuthenticated && (
            <Button
              variant="outline"
              className={`border-gray-300 ${isLocalFavorite ? "bg-gray-100" : ""}`}
              onClick={handleAddFavorite}
              disabled={isLocalFavorite || favoritesLoading}
            >
              {isLocalFavorite ? "En la estantería" : "Añadir a la estantería"}
            </Button>
          )}
          {!isAuthenticated && (
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => router.push("/login")}
            >
              Añadir a la estantería
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}