import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  addFavoriteAsync,
  removeFavoriteAsync,
} from "@/service/favorites/favoritesService";
import { deleteNovelAsync } from "@/service/novels/novelsService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getChaptersAsync } from "@/service/chapter/chapterService";
import { selectIsOperationLoading } from "@/store/slices/favoritesSlice";

interface CardNovelProps {
  novel: Novel;
}

export default function CardBook({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    favorites,
    error: favoritesError,
  } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [isDeletingNovel, setIsDeletingNovel] = useState(false);

  // Verificar roles del usuario
  const isAdmin = user?.role === "Admin";
  const isModerator = user?.role === "Moderator";
  const canManageNovel = isAdmin; // Solo admin puede editar/eliminar
  const canAddChapter = isAdmin || isModerator; // Admin y moderator pueden añadir capítulos

  const isFavorite = favorites.some((fav) => fav.novel_id === novel.id);

  // Estado de carga por operación
  const addOperationKey = user?.id ? `${user.id}-${novel.id}-add` : '';
  const removeOperationKey = user?.id ? `${user.id}-${novel.id}-remove` : '';
  const isAddingFavorite = useSelector(selectIsOperationLoading(addOperationKey));
  const isRemovingFavorite = useSelector(selectIsOperationLoading(removeOperationKey));
  const isFavoriteOperationLoading = isAddingFavorite || isRemovingFavorite;

  useEffect(() => {
    if (favoritesError) {
      toast.error("Error al gestionar favoritos");
    }
  }, [favoritesError]);

  const handleFavoriteAction = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para gestionar tus favoritos");
      router.push("/login");
      return;
    }

    if (isFavoriteOperationLoading) return;

    try {
      if (isFavorite) {
        // Encontrar el favorito para obtener su ID
        const favoriteItem = favorites.find(
          (fav) => fav.novel_id === novel.id
        );
        if (favoriteItem) {
          await dispatch(removeFavoriteAsync(favoriteItem.id));
          toast.warning("Novela eliminada de la estantería");
        }
      } else {
        await dispatch(addFavoriteAsync(novel));
        toast.success("Novela añadida a la estantería");
      }
    } catch (error) {
      console.error("Error al gestionar favoritos:", error);
      toast.error("Error al gestionar favoritos");
    }
  };

  const handleDeleteNovel = async () => {
    if (!canManageNovel) {
      toast.error("No tienes permisos para eliminar novelas");
      return;
    }

    setIsDeletingNovel(true);
    try {
      await dispatch(deleteNovelAsync(novel.id));
      toast.success("Novela eliminada correctamente", {
        position: "top-right",
      });
      router.push("/novels");
    } catch (error) {
      console.error("Error al eliminar novela:", error);
      toast.error("Error al eliminar la novela");
    } finally {
      setIsDeletingNovel(false);
    }
  };

  const handleUpdateNovel = () => {
    if (!canManageNovel) {
      toast.error("No tienes permisos para editar novelas");
      return;
    }
    router.push(`/update/${novel.id}`);
  };

  const handleAddChapter = () => {
    if (!canAddChapter) {
      toast.error("No tienes permisos para añadir capítulos");
      return;
    }
    router.push(`/chapters/${novel.id}/create`);
  };

  const navigateToBook = async () => {
    try {
      const chapters = await dispatch(getChaptersAsync(novel.id));

      if (chapters && Array.isArray(chapters) && chapters.length > 0) {
        const sortedChapters = [...chapters].sort(
          (a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number
        );
        const firstChapter = sortedChapters[0];

        router.push(`/books/${novel.id}/chapters/${firstChapter.id}`);
      } else {
        toast.info("Esta novela aún no tiene capítulos.");
      }
    } catch (error) {
      console.error("Error al obtener los capítulos:", error);
      toast.error("No se pudieron cargar los capítulos.");
    }
  };

  const { title, image, category, description } = novel;

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Layout único que se adapta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Título - Mobile: orden 1, Desktop: columna 2-3 */}
          <h3
            className="font-bold text-lg text-center md:text-left leading-tight text-foreground hover:text-primary transition-colors order-1 md:order-2 md:col-span-2"
            title={title || ""}
          >
            {title || "Sin título"}
          </h3>

          {/* Imagen - Mobile: orden 2, Desktop: columna 1 (ocupa todas las filas) */}
          <div className="flex justify-center items-center order-2 md:order-1 md:row-span-4 md:col-span-1">
            <Image
              src={image || "/placeholder.svg"}
              alt={title || "Portada de novela sin título"}
              width={200}
              height={200}
              className="object-cover rounded-sm hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Categoría y Descripción - Mobile: orden 3, Desktop: columna 2-3 */}
          <div className="text-xs text-muted-foreground md:text-left order-3 md:order-3 md:col-span-2">
            <p
              className="text-sm text-muted-foreground mb-2"
              title={description || ""}
            >
              {description || "Sin descripción"}
            </p>
            <p>Categoría: {category || "Sin categoría"}</p>
          </div>

          {/* Botones principales (Leer y Favoritos) - Mobile: orden 4, Desktop: columna 2-3 */}
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-2 order-4 md:order-4 md:col-span-2">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white md:col-span-1"
              onClick={navigateToBook}
            >
              Leer
            </Button>

            {isAuthenticated ? (
              <Button
                variant={isFavorite ? "secondary" : "outline"}
                className={`border-border md:col-span-2 ${
                  isFavorite
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground"
                }`}
                onClick={handleFavoriteAction}
                disabled={isFavoriteOperationLoading}
              >
                {isFavoriteOperationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isFavorite ? (
                  "Eliminar de la estantería"
                ) : (
                  "Añadir a la estantería"
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-gray-300 md:col-span-2"
                onClick={() => router.push("/login")}
              >
                Añadir a la estantería
              </Button>
            )}
          </div>

          {/* Botones de administración - Solo visibles para usuarios con permisos */}
          {isAuthenticated && (canManageNovel || canAddChapter) && (
            <div className="flex flex-col md:flex-row gap-2 order-5 md:order-5 md:col-span-2">
              {/* Botón Añadir Capítulo - Admin y Moderator */}
              {canAddChapter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddChapter}
                  className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <Plus className="h-4 w-4" />
                  Añadir Capítulo
                </Button>
              )}

              {/* Botones de Admin - Solo Admin */}
              {canManageNovel && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateNovel}
                    className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        disabled={isDeletingNovel}
                      >
                        {isDeletingNovel ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {isDeletingNovel ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Estás completamente seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará
                          permanentemente la novela
                          <strong> {title} </strong>y todos sus capítulos
                          asociados de nuestros servidores, incluyendo la imagen
                          almacenada en Cloudinary.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteNovel}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeletingNovel}
                        >
                          {isDeletingNovel ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Eliminando...
                            </>
                          ) : (
                            "Sí, eliminar novela"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}