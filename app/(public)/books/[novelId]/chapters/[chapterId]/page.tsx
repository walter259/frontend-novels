"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useParams } from "next/navigation";

import { getNovelByIdAsync } from "@/service/novels/novelsService";

import { Card } from "@/components/ui/card";
import { getChapterAsync, getChaptersAsync } from "@/service/chapter/chapterService";
import ChapterHeader from "../components/ChapterHeader";
import ChapterContent from "../components/ChapterContent";
import ChapterNavigation from "../components/ChapterNavigation";

export default function ChapterPage() {
  const params = useParams();
  const novelId = Number(params.novelId);
  const chapterId = Number(params.chapterId);
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados locales
  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener información de la novela y el capítulo en paralelo
        const [fetchedNovel, fetchedChapter, fetchedChapters] = await Promise.all([
          dispatch(getNovelByIdAsync(novelId.toString())),
          dispatch(getChapterAsync(novelId, chapterId)),
          dispatch(getChaptersAsync(novelId))
        ]);
        
        setNovel(fetchedNovel);
        setCurrentChapter(fetchedChapter);
        setAllChapters(fetchedChapters);
      } catch (err) {
        console.error("Error fetching chapter data:", err);
        setError("No se pudo cargar el capítulo. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    if (novelId && chapterId) {
      fetchData();
    }
  }, [dispatch, novelId, chapterId]);
  
  // Encontrar el índice del capítulo actual
  const currentChapterIndex = allChapters.findIndex(
    chapter => chapter.id === chapterId
  );
  
  // Obtener capítulos anterior y siguiente
  const previousChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </Card>
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
        {/* Header del capítulo */}
        <ChapterHeader 
          novel={novel} 
          chapter={currentChapter}
          chapterNumber={currentChapterIndex + 1}
          totalChapters={allChapters.length}
        />
        
        {/* Contenido del capítulo */}
        <ChapterContent chapter={currentChapter} />
        
        {/* Navegación */}
        <ChapterNavigation
          novelId={novelId}
          previousChapter={previousChapter}
          nextChapter={nextChapter}
          isFirstChapter={currentChapterIndex === 0}
          isLastChapter={currentChapterIndex === allChapters.length - 1}
        />
      </div>
    </div>
  );
}