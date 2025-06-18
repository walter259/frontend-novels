// pages/chapter/[novelId]/[chapterId]/page.tsx
"use client";

import { useEffect, useState, Suspense, lazy, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getNovelByIdAsync } from "@/service/novels/novelsService";
import { getChapterAsync, getChaptersAsync, getChapterCacheInfo } from "@/service/chapter/chapterService";
import { getNovelsCacheInfo } from "@/service/novels/novelsService";

// Lazy loading de componentes
const ChapterHeader = lazy(() => import("../components/ChapterHeader"));
const ChapterContent = lazy(() => import("../components/ChapterContent"));
const ChapterNavigation = lazy(() => import("../components/ChapterNavigation"));

// Skeleton components
const ChapterHeaderSkeleton = () => (
  <Card className="p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </Card>
);

const ChapterContentSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="px-6 py-3 border-b border-border/50 bg-accent/5">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
    <div className="p-6 md:p-8 lg:p-12">
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="h-6 bg-gray-200 rounded w-full"></div>
        ))}
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </Card>
);

const ChapterNavigationSkeleton = () => (
  <Card className="p-4">
    <div className="flex justify-between items-center animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  </Card>
);

// Hook personalizado para debuggear el caché
const useCacheDebug = () => {
  const [cacheInfo, setCacheInfo] = useState<{
    chapterCache: ReturnType<typeof getChapterCacheInfo>;
    novelsCache: ReturnType<typeof getNovelsCacheInfo>;
  } | null>(null);

  const updateCacheInfo = useCallback(() => {
    const chapterCache = getChapterCacheInfo();
    const novelsCache = getNovelsCacheInfo();
    setCacheInfo({ chapterCache, novelsCache });
  }, []);

  useEffect(() => {
    // Actualizar info del caché cada 5 segundos
    const interval = setInterval(updateCacheInfo, 5000);
    updateCacheInfo(); // Actualizar inmediatamente
    
    return () => clearInterval(interval);
  }, [updateCacheInfo]);

  return { cacheInfo, updateCacheInfo };
};

// Hook personalizado para manejar los datos del capítulo
const useChapterData = (novelId: number, chapterId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los datos en paralelo, pero con caché inteligente
      const [fetchedNovel, fetchedChapter, fetchedChapters] = await Promise.all([
        dispatch(getNovelByIdAsync(novelId.toString())),
        dispatch(getChapterAsync(novelId, chapterId)),
        dispatch(getChaptersAsync(novelId))
      ]);
      
      // Solo actualizar el estado si los datos son válidos
      if (fetchedNovel) {
        setNovel(fetchedNovel);
      }
      if (fetchedChapter) {
        setCurrentChapter(fetchedChapter);
      }
      if (fetchedChapters) {
        setAllChapters(fetchedChapters);
      }
    } catch (err) {
      console.error("Error fetching chapter data:", err);
      setError("No se pudo cargar el capítulo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, novelId, chapterId]);

  useEffect(() => {
    if (novelId && chapterId) {
      fetchData();
    }
  }, [fetchData, novelId, chapterId]);

  return { novel, currentChapter, allChapters, loading, error, refetch: fetchData };
};

export default function ChapterPage() {
  const params = useParams();
  const novelId = Number(params.novelId);
  const chapterId = Number(params.chapterId);
  
  const { novel, currentChapter, allChapters, loading, error } = useChapterData(novelId, chapterId);
  const { cacheInfo } = useCacheDebug(); // Usar el hook de debug
  
  // Debug: Log cache info en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && cacheInfo) {
      console.log('Cache Debug Info:', cacheInfo);
    }
  }, [cacheInfo]);
  
  // Memoizar cálculos de navegación
  const navigationData = useMemo(() => {
    const currentChapterIndex = allChapters.findIndex(chapter => chapter.id === chapterId);
    const previousChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
    const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;
    
    return {
      currentChapterIndex,
      previousChapter,
      nextChapter,
      isFirstChapter: currentChapterIndex === 0,
      isLastChapter: currentChapterIndex === allChapters.length - 1
    };
  }, [allChapters, chapterId]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          <ChapterHeaderSkeleton />
          <ChapterContentSkeleton />
          <ChapterNavigationSkeleton />
        </div>
      </div>
    );
  }
  
  if (error || !novel || !currentChapter) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8">
          <div className="text-center text-red-500">
            {error || "No se encontró el capítulo solicitado."}
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header del capítulo con lazy loading */}
        <Suspense fallback={<ChapterHeaderSkeleton />}>
          <ChapterHeader 
            novel={novel} 
            chapter={currentChapter}
            chapterNumber={navigationData.currentChapterIndex + 1}
            totalChapters={allChapters.length}
          />
        </Suspense>
        
        {/* Contenido del capítulo con lazy loading */}
        <Suspense fallback={<ChapterContentSkeleton />}>
          <ChapterContent chapter={currentChapter} />
        </Suspense>
        
        {/* Navegación con lazy loading */}
        <Suspense fallback={<ChapterNavigationSkeleton />}>
          <ChapterNavigation
            novelId={novelId}
            previousChapter={navigationData.previousChapter}
            nextChapter={navigationData.nextChapter}
            isFirstChapter={navigationData.isFirstChapter}
            isLastChapter={navigationData.isLastChapter}
          />
        </Suspense>
      </div>
    </div>
  );
}