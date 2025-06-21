"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { getNovelByIdAsync } from "@/service/novels/novelsService";
import CardBook from "../components/CardBook";
import { useParams } from "next/navigation";
import ChapterList from "../components/ChapterList";

export default function BookPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useDispatch<AppDispatch>();
  
  // Estado local para almacenar la novela
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener datos de la novela
  useEffect(() => {
    const fetchNovel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener la novela actual
        const fetchedNovel = await dispatch(getNovelByIdAsync(id));
        if (fetchedNovel) {
          setNovel(fetchedNovel);
        }
      } catch (err) {
        console.error("Error fetching novel:", err);
        setError("No se pudo cargar la información de la novela. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNovel();
  }, [dispatch, id]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Cargando información de la novela...</div>
      </div>
    );
  }
  
  if (error || !novel) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          {error || "No se encontró la novela solicitada."}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Información principal de la novela */}
        <CardBook novel={novel} />
        
        {/* Lista de capítulos - Ahora pasa el ID correcto */}
        <ChapterList novelId={novel.id} />
      </div>
    </div>
  );
}