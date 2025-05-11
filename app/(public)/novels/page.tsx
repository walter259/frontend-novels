"use client"
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SearchNovel from "./SearchNovel";


export default function Novels() {
  const novels = useSelector((state: RootState) => state.novels.novels);

  return (
    <div className="w-full">
      <h1 className="text-center text-3xl font-bold mb-6">Novels</h1>
      <SearchNovel initialNovels={novels} />
    </div>
  );
}