// src/app/(dashboard)/responsaveis/[id]/editar/page.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

// Schema
const editResponsavelSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().optional(),
  observations: z.string().optional(),
});

type EditResponsavelFormData = z.infer<typeof editResponsavelSchema>;

// Mock
const responsaveisMock = [
  {
    id: "1",
    name: "Ana Clara Santos",
    phone: "11988887777",
    email: "ana@email.com",
    cpf: "123.456.789-00",
    observations: "Mãe do Enzo e da Maria. Trabalha home office.",
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    phone: "11977778888",
    email: "carlos@email.com",
    cpf: "987.654.321-00",
    observations: "Pai da Maria Luiza.",
  },
];
const EditarResponsavelPage = () => {       //Inicio da função
const { id } = useParams();

  // HOOKS NO TOPO — SEMPRE!
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditResponsavelFormData>({
    resolver: zodResolver(editResponsavelSchema),
  });

  // BUSCA O RESPONSÁVEL DEPOIS DOS HOOKS
  const responsavel = responsaveisMock.find(r => r.id === id);

  // PREENCHE OS CAMPOS COM reset() DENTRO DO useEffect
  useEffect(() => {
    if (responsavel) {
      reset({
        name: responsavel.name,
        phone: responsavel.phone,
        email: responsavel.email,
        cpf: responsavel.cpf,
        observations: responsavel.observations,
      });
    }
  }, [responsavel, reset]);

  // SE NÃO ENCONTRAR → MOSTRA ERRO (DEPOIS DOS HOOKS!)
  if (!responsavel) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Responsável não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/dashboard/responsaveis">Voltar</Link>
        </Button>
      </div>
    );
  }

  // onSubmit ÚNICO (sem redeclaração)
  const onSubmit = async (data: EditResponsavelFormData) => {
    try {
      console.log("Responsável atualizado:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Responsável atualizado com sucesso!", {
        description: `${data.name} foi salvo com as novas informações.`,
      });
    } catch {
      toast.error("Erro ao salvar responsável");
    }
  };

    return ( 
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/responsavel/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Responsável</h1>
          <p className="text-gray-600">Atualize as informações de {responsavel.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6 text-purple-600" />
            Editar Dados do Responsável
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                className="resize-none"
                rows={4}
                {...register("observations")}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/responsavel/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
     );
}
 
export default EditarResponsavelPage;