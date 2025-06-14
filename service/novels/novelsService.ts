import { addNovel, removeNovel, setError, setLoading, setNovels, updateNovels } from "@/store/slices/novelsSlice";
import api from "../api";
import { AppDispatch } from "@/store/store";

interface NovelsResponse {
  novels: Novel[];
}

interface NovelResponse {
  novel: Novel;
}

interface CreateNovelData {
  title: string;
  description: string;
  category_id: number;
  image?: File;
}

interface UpdateNovelData {
  title?: string;
  description?: string;
  category_id?: number;
  image?: File;
}

export const getNovelsAsync = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const response = await api.get<NovelsResponse>("/novels");
    const novels = response.data.novels;
    dispatch(setNovels(novels));
    return novels;
  } catch (error) {
    dispatch(setError("Error fetching novels"));
    console.error("Error fetching novels:", error);
    throw error;
  }
};

export const createNovelAsync = (data: CreateNovelData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category_id", data.category_id.toString());
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await api.post<NovelResponse>("/novels/create", formData);

    const novel = response.data.novel;
    console.log("novel",novel);
    
    dispatch(addNovel(novel));
    return novel;
  } catch (error) {
    dispatch(setError("Error creating novel"));
    console.error("Error creating novel:", error);
    throw error;
  }
};

export const updateNovelAsync = (id: string, data: UpdateNovelData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const formData = new FormData();
    
    // Solo agregar campos que realmente se van a actualizar
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.category_id !== undefined) formData.append("category_id", data.category_id.toString());
    if (data.image) formData.append("image", data.image);

    // Cambié PUT por PATCH y ajusté la URL para coincidir con tu backend
    const response = await api.post<NovelResponse>(`/novels/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const novel = response.data.novel;
    dispatch(updateNovels(novel));
    return novel;
  } catch (error) {
    dispatch(setError(`Error updating novel ${id}`));
    console.error(`Error updating novel ${id}:`, error);
    throw error;
  }
};

export const deleteNovelAsync = (id: number) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    await api.delete(`/novels/delete/${id}`);
    dispatch(removeNovel(id));
  } catch (error) {
    dispatch(setError(`Error deleting novel ${id}`));
    console.error(`Error deleting novel ${id}:`, error);
    throw error;
  }
};

export const getNovelByIdAsync = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const response = await api.get<NovelResponse>(`/novels/${id}`);
    const novel = response.data.novel;
    return novel;
  } catch (error) {
    dispatch(setError(`Error fetching novel ${id}`));
    console.error(`Error fetching novel ${id}:`, error);
    throw error;
  }
};