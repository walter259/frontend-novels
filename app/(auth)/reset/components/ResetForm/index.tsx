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
import { ResetSchema } from "@/lib/validators/reset";
import { requestResetLink } from "@/service/auth/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function ResetForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetSchema>) => {
    setIsLoading(true);
    try {
      await requestResetLink(values.email);
      toast.success("Enlace enviado");
      router.push("/login");
    } catch (error) {
      console.log(error)
      toast.error("Error al solicitar restablecimiento");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Form {...form}>
      <form
        id="reset-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem]"
      >
        {/* Correo electrónico */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Ingresa correo</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ingresa tu correo"
                  disabled={isLoading} 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de enviar */}
        <Button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-black/90"
          disabled={isLoading} 
        >
          {isLoading ? "Cargando..." : "ENVIAR ENLACE"}
        </Button>
      </form>
    </Form>
  );
}