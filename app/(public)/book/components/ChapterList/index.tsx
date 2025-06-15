// components/ChapterList/index.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import CardChapter from "../CardChapter/index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { getChaptersAsync } from "@/service/chapter/chapterService";
import { clearChapters } from "@/store/slices/chapterSlice";

interface ChapterListProps {
  novelId: number;
}

export default function ChapterList({ novelId }: ChapterListProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Usar el estado global de Redux en lugar del estado local
  const { chapters, loading, error } = useSelector((state: RootState) => state.chapters);
  
  // Solo mantener el estado de ordenamiento localmente
  const [sortAscending, setSortAscending] = useState(true);
  
  // Cargar capítulos al montar el componente o cambiar novelId
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        // Limpiar capítulos anteriores al cambiar de novela
        dispatch(clearChapters());
        
        // Cargar nuevos capítulos
        await dispatch(getChaptersAsync(novelId));
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };
    
    if (novelId) {
      fetchChapters();
    }
    
    // Limpiar capítulos al desmontar o cambiar novelId
    return () => {
      dispatch(clearChapters());
    };
  }, [dispatch, novelId]);
  
  // Ordenar capítulos usando el estado global
  const sortedChapters = [...chapters].sort((a, b) => {
    return sortAscending 
      ? a.chapter_number - b.chapter_number 
      : b.chapter_number - a.chapter_number;
  });
  
  // Manejar cambio de orden
  const toggleSortOrder = () => {
    setSortAscending(!sortAscending);
  };
  
  if (loading) {
    return (
      <Card className="w-full p-6">
        <div className="text-center">Cargando capítulos...</div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full p-6">
        <div className="text-center text-red-500">
          {error}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Capítulos</h2>
        {chapters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-2"
          >
            Ordenar {sortAscending ? "Primero → Último" : "Último → Primero"}
            {sortAscending ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {chapters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Esta novela aún no tiene capítulos disponibles.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedChapters.map((chapter) => (
            <CardChapter
              key={chapter.id}
              chapter={chapter}
              novelId={novelId}
            />
          ))}
        </div>
      )}
    </Card>
  );
}