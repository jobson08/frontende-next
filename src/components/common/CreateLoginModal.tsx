/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/src/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

// Schema para edição (senha opcional)
const editSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().optional(), // não exige senha na edição
});

type FormData = z.infer<typeof editSchema>;

interface EditLoginModalProps {
  name: string;
  currentEmail: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (email: string, password: string) => Promise<void> | void;
}

const EditarLoginModal = ({
  name,
  currentEmail,
  open,
  onOpenChange,
  onSave,
}: EditLoginModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: currentEmail || "",
      password: "",
    },
  });

  // Resetar form sempre que o modal abrir
  useEffect(() => {
    if (open) {
      reset({
        email: currentEmail || "",
        password: "",
      });
    }
  }, [open, currentEmail, reset]);

const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);

  try {
    await onSave(data.email, data.password || ""); // senha vazia = não altera
    toast.success("Login atualizado com sucesso!");
    reset();
    onOpenChange(false);
  } catch (err: any) {
    toast.error(err.message || "Erro ao atualizar login");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/70 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <DialogHeader className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Editar Acesso
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Atualize o login de
              <br />
              <span className="font-bold text-xl text-orange-600">{name}</span>
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="funcionario@academia.com"
                  className="pl-12 h-12"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha (opcional)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Deixe em branco para manter a senha atual"
                  className="pl-12 h-12"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>Atualizar Login</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default EditarLoginModal;