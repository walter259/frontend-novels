import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    token: z.string().nonempty({ message: "El token es requerido" }),
    email: z.string().email({ message: "Ingresa un correo válido" }).nonempty({ message: "El correo es requerido" }),
    password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }).nonempty({ message: "La contraseña es requerida" }),
    password_confirmation: z.string().nonempty({ message: "Confirma tu contraseña" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });