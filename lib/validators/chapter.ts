import { z } from "zod";

export const ChapterSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .trim(),
  content: z
    .string()
    .min(100, "El contenido debe tener al menos 100 caracteres")
    .max(50000, "El contenido no puede exceder 50,000 caracteres")
    .trim(),
});