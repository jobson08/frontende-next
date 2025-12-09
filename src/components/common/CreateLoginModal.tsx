"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle, } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { Loader2, Mail, Lock, UserCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DialogFooter, DialogHeader } from "../ui/dialog";

const createLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type CreateLoginFormData = z.infer<typeof createLoginSchema>;

interface CreateLoginModalProps {
  type: "ALUNO" | "RESPONSAVEL";
  name: string;
  currentEmail?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateLoginSchema = ({ type, name, open,currentEmail =null, onOpenChange }: CreateLoginModalProps) => {

const [isSubmitting, setIsSubmitting] = useState(false);
const isEdit = !!currentEmail;

 const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLoginFormData>({
    resolver: zodResolver(createLoginSchema),
    defaultValues: {
      email: currentEmail || "",
    },
  });

  const onSubmit = async (data: CreateLoginFormData) => {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (isEdit) {
        toast.success("Login atualizado!", {
          description: `As credenciais de ${name} foram alteradas.`,
        });
      } else {
        toast.success("Login criado com sucesso!", {
          description: `${name} agora pode acessar o app com ${data.email}`,
        });
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar login");
    } finally {
      setIsSubmitting(false);
    }
  };

    return ( 
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserCheck className="h-10 w-10 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl">
            {isEdit ? "Editar Login" : "Criar Login"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEdit ? "Atualize" : "Crie"} as credenciais de acesso para
            <span className="font-semibold text-foreground"> {name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="exemplo@gmail.com"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Senha {isEdit ? "(deixe em branco para manter)" : "*"}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <DialogFooter className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {isEdit ? "Atualizar" : "Criar"} Login
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
     );
}
 
export default CreateLoginSchema;