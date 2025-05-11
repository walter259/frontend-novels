// components/NovelList.tsx
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNovelsAsync } from "@/service/novels/novelsService";
import { RootState, AppDispatch } from "@/store/store";
import CardNovel from "../CardNovel";

interface NovelListProps {
  novels: Novel[]; // Nueva prop para recibir novelas filtradas
}

export default function NovelList({ novels }: NovelListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.novels);

  useEffect(() => {
    // Carga las novelas al montar el componente solo si no se pasan novelas como prop
    if (!novels.length && !loading) {
      dispatch(getNovelsAsync());
    }
  }, [dispatch, novels, loading]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!novels.length) {
    return <div className="text-center p-4">No novels found.</div>;
  }

  return (
    <div className="w-full grid grid-cols-1 gap-4 p-4 place-content-center">
      {novels.map((novel) => (
        <CardNovel key={novel.id} novel={novel} />
      ))}
    </div>
  );
}