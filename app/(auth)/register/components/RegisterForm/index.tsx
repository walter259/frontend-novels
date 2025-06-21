"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/lib/validators/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser } from "@/service/auth/authService";
import { useState } from "react";

// Función para formatear el nombre
const formatName = (name: string): string => {
  return name
    .trim() // Elimina espacios al inicio y final
    .toLowerCase() // Convierte todo a minúsculas
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitaliza primera letra de cada palabra
    .replace(/\s+/g, " "); // Reemplaza múltiples espacios por uno solo
};

// Función para formatear el nombre de usuario
const formatUsername = (username: string): string => {
  return username
    .trim() // Elimina espacios al inicio y final
    .toLowerCase() // Convierte todo a minúsculas
    .replace(/\s+/g, ""); // Elimina todos los espacios
};

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      user: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setIsLoading(true);
    try {
      // Formatear los valores antes de enviar
      const formattedValues = {
        ...values,
        name: formatName(values.name),
        user: formatUsername(values.user),
      };

      await registerUser(formattedValues);
      toast.success("Registro exitoso");
      router.push("/novels");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorDetails = error.response?.data?.errors || {};
      if (errorDetails.user && errorDetails.user[0]) {
        form.setError("user", {
          type: "server",
          message: "El nombre de usuario ya está siendo usado.",
        });
      }
      if (errorDetails.email && errorDetails.email[0]) {
        form.setError("email", {
          type: "server",
          message: "El email ya está siendo usado.",
        });
      }

      toast.error("Error al registrar");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador para el campo nombre
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNameChange = (field: any, value: string) => {
    // Limitar longitud y aplicar formato
    if (value.length <= 25) {
      const formatted = formatName(value);
      field.onChange(formatted);
    }
  };

  // Manejador para el campo usuario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUsernameChange = (field: any, value: string) => {
    // Limitar longitud y aplicar formato
    if (value.length <= 15) {
      const formatted = formatUsername(value);
      field.onChange(formatted);
    }
  };

  return (
    <Form {...form}>
      <form
        id="register-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem]"
      >
        <div className="flex justify-between gap-4">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresar nombre"
                    {...field}
                    onChange={(e) => handleNameChange(field, e.target.value)}
                    maxLength={25}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre de usuario */}
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresar usuario"
                    {...field}
                    onChange={(e) =>
                      handleUsernameChange(field, e.target.value)
                    }
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ingresar correo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Ingresar contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirmar contraseña */}
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirma tu contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de enviar con estado de carga */}
        <Button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-black/90"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Registrarse"}
        </Button>
      </form>
    </Form>
  );
}
