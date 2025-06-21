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
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense } from "react";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/lib/validators/reset-password";

import { useState } from "react";
import { updatePassword } from "@/service/auth/authService";

// Component that uses useSearchParams
function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || "",
      email: email || "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    setIsLoading(true);
    try {
      const response = await updatePassword(values);
      console.log("Contraseña restablecida:", response);
      toast.success("Contraseña restablecida exitosamente.");
      setTimeout(() => router.push("/login"), 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al restablecer la contraseña.");
      console.log("Error detallado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return <div>Error: Token o email no encontrado en la URL.</div>;
  }

  return (
    <Form {...form}>
      <form
        id="reset-password-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem]"
      >
        {/* Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
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
                  placeholder="Confirma tu nueva contraseña"
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
          {isLoading ? "Cargando..." : "RESTABLECER CONTRASEÑA"}
        </Button>
      </form>
    </Form>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="space-y-5 w-[99%] p-[0.3rem]">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}