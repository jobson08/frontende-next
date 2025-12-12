"use client";

import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock  } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/src/components/ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";


const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

interface CreateLoginModalProps {
  name: string;
  currentEmail?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateLoginModal= ({ 
  name,
  currentEmail = null,
  open,
  onOpenChange,
}: CreateLoginModalProps) => {

const [isSubmitting, setIsSubmitting] = useState(false);
const isEdit = !!currentEmail;

const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: currentEmail || "" },
  });

const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      toast.success(isEdit ? "Login atualizado!" : "Login criado com sucesso!", {
        description: `${name} agora pode acessar o sistema`,
      });
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar login");
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
              {isEdit ? "Editar Acesso" : "Criar Acesso"}
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              {isEdit ? "Atualize" : "Crie"} o login de
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
              <Label htmlFor="password">
                Senha {isEdit && <span className="text-gray-500 text-sm">(opcional na edição)</span>}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
                  className="pl-12 h-12"
                  {...register("password", { required: !isEdit ? "Senha obrigatória" : false })}
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
                  <>{isEdit ? "Atualizar" : "Criar"} Login</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
     );
}
 
export default CreateLoginModal;