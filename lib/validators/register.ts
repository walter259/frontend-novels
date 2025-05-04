import { z } from "zod";

const requiredErrorMsg = "Este campo no puede estar vacío";
const emailErrorMsg = "Por favor, ingresa un correo electrónico válido";
const minPasswordLengthMsg = "La contraseña debe tener al menos 8 caracteres";
const passwordMismatchMsg = "Las contraseñas no coinciden";
const maxLengthMsg = "Este campo no puede exceder los 255 caracteres";

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: requiredErrorMsg })
      .email({ message: emailErrorMsg })
      .max(255, { message: maxLengthMsg })
      .trim(),
    user: z
      .string()
      .min(1, { message: requiredErrorMsg })
      .max(255, { message: maxLengthMsg })
      .trim(),
    name: z
      .string()
      .min(1, { message: requiredErrorMsg })
      .max(255, { message: maxLengthMsg })
      .trim(),
    password: z
      .string()
      .min(1, { message: requiredErrorMsg })
      .min(8, { message: minPasswordLengthMsg })
      .trim(),
    password_confirmation: z
      .string()
      .min(1, { message: requiredErrorMsg })
      .trim(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: passwordMismatchMsg,
    path: ["password_confirmation"], // Indica que el error debe mostrarse en el campo `password_confirmation`
  });

export type RegisterFormData = z.infer<typeof RegisterSchema>;