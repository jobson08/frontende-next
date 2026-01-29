/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/responsavel/novo/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";
import InputCPF from "@/src/components/common/InputCPF";
import InputTelefone from "@/src/components/common/InputTelefone";
import { useRouter } from "next/navigation";

// Função para gerar senha aleatória
function gerarSenhaAleatoria(tamanho = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Schema Zod
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório para envio do login" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoResponsavelPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter(); // ← adicionado para redirecionar

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

 const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    // Normaliza email para minúsculo
    data.email = data.email.toLowerCase().trim();

    // Gera senha aleatória
    const senhaTemporaria = gerarSenhaAleatoria(10);

    // Envia para o backend (rota corrigida)
    const response = await api.post('/tenant/responsaveis', {
      nome: data.nome,
      email: data.email,
      telefone: data.phone,
      cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null, // limpa máscara
      observacoes: data.observations,
      password: senhaTemporaria,
    });

    toast.success("Responsável criado com sucesso!", {
      description: (
        <div className="space-y-3 text-sm">
          <p className="font-medium">Responsável adicionado com login gerado.</p>
          
          <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
            <p className="font-semibold mb-1">Dados do login criado:</p>
            <div className="space-y-1">
              <p><span className="font-medium">Nome:</span> {data.nome || "Não informado"}</p>
              <p><span className="font-medium">E-mail (usuário):</span> {data.email || "Não gerado"}</p>
              <p className="font-bold text-blue-700">
                <span className="font-medium">Senha temporária:</span> {senhaTemporaria || "Gerada automaticamente"}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-2">
            Copie a senha e envie ao responsável imediatamente. Ele deve trocar no primeiro acesso.
          </p>
        </div>
      ),
      duration: 30000, // tempo suficiente para copiar
      action: {
        label: "Copiar senha",
        onClick: () => {
          navigator.clipboard.writeText(email || "");
          navigator.clipboard.writeText(senhaTemporaria || "");
          toast("Usuario e Senha copiada para a área de transferência!");
        },
      },
    });

    // Redireciona automaticamente para a lista de responsáveis após 2 segundos
    setTimeout(() => {
      router.push("/responsavel");  // ← rota corrigida (plural)
    }, 2000);

  } catch (error: any) {
    console.error("[Criar Responsável] Erro:", error);
    toast.error("Erro ao criar responsável", {
      description: error.response?.data?.error || error.response?.data?.details?.[0]?.message || error.message || "Verifique os dados e tente novamente",
    });
  } finally {
    setIsSubmitting(false);
  }
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
          <h1 className="text-3xl font-bold">Novo Responsável</h1>
          <p className="text-gray-600">Preencha os dados do responsável</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dados do Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="Maria Oliveira Santos" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* E-mail (obrigatório para login) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="maria@email.com"
                {...register("email", {
                  // Transforma em minúsculo AO DIGITAR (UX imediata)
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                    setValue("email", e.target.value);
                  },
                })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">O login será criado automaticamente e enviado para este e-mail</p>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <InputTelefone id="phone" placeholder="(11) 97777-6666" {...register("phone")} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <InputCPF id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Informações adicionais sobre o responsável..."
                className="resize-none"
                rows={4}
                {...register("observations")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando responsável...
                  </>
                ) : (
                  "Criar Responsável"
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

export default NovoResponsavelPage;