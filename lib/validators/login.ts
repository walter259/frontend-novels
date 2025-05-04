// lib/validators/login.ts
import { z } from "zod";

export const LoginSchema = z.object({
  identifier: z.string().min(1, "El correo o nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  remember: z.boolean().optional(), // Añade el campo remember como opcional
});