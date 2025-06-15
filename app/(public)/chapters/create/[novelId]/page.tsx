"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
// AGREGAR ESTA IMPORTACIÓN


import ChapterForm from "./components/ChapterForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getNovelByIdAsync } from "@/service/novels/novelsService";

export default function CreateChapterPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const novelId = params.novelId as string;
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { novels } = useSelector((state: RootState) => state.novels);
  
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [isLoadingNovel, setIsLoadingNovel] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar permisos
  const isAdmin = user?.role === "Admin";
  const isModerator = user?.role === "Moderator";
  const canAddChapter = isAdmin || isModerator;

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para crear capítulos");
      router.push("/login");
      return;
    }

    // Verificar permisos
    if (!canAddChapter) {
      toast.error("No tienes permisos para crear capítulos");
      router.push("/");
      return;
    }

    // Validar novelId
    if (!novelId || isNaN(Number(novelId))) {
      setError("ID de novela inválido");
      setIsLoadingNovel(false);
      return;
    }

    loadNovel();
  }, [isAuthenticated, canAddChapter, novelId, router]);

  const loadNovel = async () => {
    try {
      setIsLoadingNovel(true);
      setError(null);

      // Primero buscar en el estado local
      const existingNovel = novels.find(novel => novel.id === Number(novelId));
      
      if (existingNovel) {
        setCurrentNovel(existingNovel);
        setIsLoadingNovel(false);
        return;
      }

      // Si no está en el estado, obtenerla del servidor
      // CORREGIR: pasar novelId como string, no como número
      const novel = await dispatch(getNovelByIdAsync(novelId));
      setCurrentNovel(novel);
      
    } catch (error) {
      console.error("Error al cargar la novela:", error);
      setError("No se pudo cargar la información de la novela");
      toast.error("Error al cargar la novela");
    } finally {
      setIsLoadingNovel(false);
    }
  };

  // Mostrar loading mientras se verifica autenticación y permisos
  if (!isAuthenticated || isLoadingNovel) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {!isAuthenticated ? "Verificando autenticación..." : "Cargando información de la novela..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no tiene permisos
  if (!canAddChapter) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground mb-4">
                No tienes permisos para crear capítulos. Solo los administradores y moderadores pueden realizar esta acción.
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

  // Mostrar error si hay problemas al cargar la novela
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
                <Button onClick={loadNovel} variant="outline">
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

  // Mostrar formulario cuando todo está listo
  return (
    <ChapterForm 
      novelId={novelId} 
      novelTitle={currentNovel?.title} 
    />
  );
}