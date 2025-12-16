"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { ChevronLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const createResponsavelSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().optional(),
  relacionamento: z.string().optional(),
  observations: z.string().optional(),
});

type CreateResponsavelFormData = z.infer<typeof createResponsavelSchema>;

const NovoResponsavelPage = () => {
    
const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateResponsavelFormData>({
    resolver: zodResolver(createResponsavelSchema),
  });

  const onSubmit = async (data: CreateResponsavelFormData) => {
    try {
      console.log("Responsável criado:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Responsável criado com sucesso!", {
        description: `${data.name} foi adicionado ao sistema.`,
      });
    } catch (error) {
      toast.error("Erro ao criar responsável");
    }
  };
return ( 
<div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/responsavel">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Responsável</h1>
          <p className="text-gray-600">Preencha os dados do responsável</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Dados do Responsável
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" placeholder="Ana Clara Santos" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" placeholder="(11) 98888-7777" {...register("phone")} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="ana@gmail.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relacionamento">Grau de parentesco</Label>
              <Input id="relacionamento" placeholder="Mãe, Pai, Avô..." {...register("relacionamento")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Informações importantes, restrições de retirada..."
                className="resize-none"
                rows={4}
                {...register("observations")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Criando..." : "Criar Responsável"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/responsavel">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    );

}
 
export default NovoResponsavelPage;