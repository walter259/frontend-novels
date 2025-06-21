"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";

import ChapterUpdateForm from "./components/ChapterUpdateForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getNovelByIdAsync } from "@/service/novels/novelsService";
import { getChapterAsync } from "@/service/chapter/chapterService";

export default function EditChapterPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const novelId = params.novelId as string;
  const chapterId = params.chapterId as string;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { novels } = useSelector((state: RootState) => state.novels);
  const { currentChapter } = useSelector((state: RootState) => state.chapters);
  
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [isLoadingNovel, setIsLoadingNovel] = useState(true);
  const [isLoadingChapter, setIsLoadingChapter] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar permisos
  const isAdmin = user?.role === "Admin";
  const isModerator = user?.role === "Moderator";
  const canEditChapter = isAdmin || isModerator;

  const loadNovel = useCallback(async () => {
    try {
      setIsLoadingNovel(true);

      // Primero buscar en el estado local
      const existingNovel = novels.find(novel => novel.id === Number(novelId));
      
      if (existingNovel) {
        setCurrentNovel(existingNovel);
        setIsLoadingNovel(false);
        return;
      }

      // Si no está en el estado, obtenerla del servidor
      const novel = await dispatch(getNovelByIdAsync(novelId));
      if (novel) {
        setCurrentNovel(novel);
      }
      
    } catch (error) {
      console.error("Error al cargar la novela:", error);
      throw new Error("No se pudo cargar la información de la novela");
    } finally {
      setIsLoadingNovel(false);
    }
  }, [novels, novelId, dispatch]);

  const loadChapter = useCallback(async () => {
    try {
      setIsLoadingChapter(true);
      
      // Obtener el capítulo del servidor
      await dispatch(getChapterAsync(Number(novelId), Number(chapterId)));
      
    } catch (error) {
      console.error("Error al cargar el capítulo:", error);
      throw new Error("No se pudo cargar la información del capítulo");
    } finally {
      setIsLoadingChapter(false);
    }
  }, [novelId, chapterId, dispatch]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      // Cargar novela y capítulo en paralelo
      await Promise.all([
        loadNovel(),
        loadChapter()
      ]);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("No se pudieron cargar los datos necesarios");
      toast.error("Error al cargar los datos");
    }
  }, [loadNovel, loadChapter]);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para editar capítulos");
      router.push("/login");
      return;
    }

    // Verificar permisos
    if (!canEditChapter) {
      toast.error("No tienes permisos para editar capítulos");
      router.push("/");
      return;
    }

    // Validar IDs
    if (!novelId || isNaN(Number(novelId))) {
      setError("ID de novela inválido");
      setIsLoadingNovel(false);
      setIsLoadingChapter(false);
      return;
    }

    if (!chapterId || isNaN(Number(chapterId))) {
      setError("ID de capítulo inválido");
      setIsLoadingNovel(false);
      setIsLoadingChapter(false);
      return;
    }

    loadData();
  }, [isAuthenticated, canEditChapter, novelId, chapterId, router, loadData]);

  // Mostrar loading mientras se verifica autenticación y se cargan los datos
  if (!isAuthenticated || isLoadingNovel || isLoadingChapter) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {!isAuthenticated && "Verificando autenticación..."}
              {isAuthenticated && isLoadingNovel && "Cargando información de la novela..."}
              {isAuthenticated && !isLoadingNovel && isLoadingChapter && "Cargando capítulo..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no tiene permisos
  if (!canEditChapter) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground mb-4">
                No tienes permisos para editar capítulos. Solo los administradores y moderadores pueden realizar esta acción.
              </p>
              <Button onClick={() => router.push("/")}>
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error si hay problemas al cargar los datos
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={loadData} variant="outline">
                  Reintentar
                </Button>
                <Button onClick={() => router.push("/novels")}>
                  Ver Novelas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar que tenemos todos los datos necesarios
  if (!currentNovel || !currentChapter) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {!currentNovel && "No se encontró la novela"}
              {!currentChapter && "No se encontró el capítulo"}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar formulario de edición cuando todo está listo
  return (
    <ChapterUpdateForm 
      novelId={novelId}
      chapterId={chapterId}
      novelTitle={currentNovel.title}
      currentChapter={currentChapter}
    />
  );
}