// src/app/(dashboard)/responsaveis/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";

// Função para gerar senha aleatória
function gerarSenhaAleatoria(tamanho = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Mock de responsáveis (em produção vem do banco)
const responsaveisMock = [
  {
    id: "1",
    name: "Maria Oliveira Santos",
    email: "maria@email.com",
    phone: "(11) 97777-6666",
    cpf: "987.654.321-00",
    observations: "Mãe do Enzo Gabriel e da Luiza.",
    username: "maria.oliveira.1",
  },
  {
    id: "2",
    name: "João Pedro Costa",
    email: "joao@email.com",
    phone: "(11) 96666-5555",
    cpf: "111.222.333-44",
    observations: "Pai do Matheus.",
    username: "joao.pedro.2",
  },
];

// Schema Zod
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditarResponsavelPage = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Busca o responsável
  const responsavel = responsaveisMock.find(r => r.id === id);

  // Pré-preenche os dados
  useEffect(() => {
    if (responsavel) {
      setValue("name", responsavel.name);
      setValue("email", responsavel.email);
      setValue("phone", responsavel.phone);
      setValue("cpf", responsavel.cpf || "");
      setValue("observations", responsavel.observations);
    }
  }, [responsavel, setValue]);

  if (!responsavel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Responsável não encontrado</h1>
          <Button asChild>
            <Link href="/responsavel">Voltar para lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Responsável atualizado:", data);
      toast.success("Responsável atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const redefinirSenha = async () => {
    const novaSenha = gerarSenhaAleatoria(10);
    console.log("=== NOVA SENHA GERADA PARA O RESPONSÁVEL (MOCK) ===");
    console.log(`Username: ${responsavel.username}`);
    console.log(`Nova senha temporária: ${novaSenha}`);
    console.log(`E-mail enviado para: ${responsavel.email}`);

    toast.success("Nova senha gerada e 'enviada' por e-mail!", {
      description: "Veja os detalhes no console",
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/responsavel">
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
          <CardTitle className="text-2xl">Editar Dados do Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Informações Pessoais */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" placeholder="Maria Oliveira Santos" {...register("name")} />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" placeholder="maria@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" placeholder="(11) 97777-6666" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="987.654.321-00" {...register("cpf")} />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Observações</h3>
              <Textarea
                id="observations"
                placeholder="Informações adicionais sobre o responsável..."
                className="resize-none min-h-32"
                rows={5}
                {...register("observations")}
              />
            </div>

            {/* Acesso do Responsável + Redefinir Senha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Acesso do Responsável</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Usuário</Label>
                  <Input value={responsavel.username || "Não criado"} disabled />
                </div>
                <div className="self-end">
                  <Button type="button" variant="outline" onClick={redefinirSenha}>
                    Redefinir Senha
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Ao redefinir, uma nova senha temporária será gerada e "enviada" por e-mail
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/responsavel">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default EditarResponsavelPage;