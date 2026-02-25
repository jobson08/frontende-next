/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Loader2, Mail, Save, UserPlus } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";
import InputTelefone from "@/src/components/common/InputTelefone";
import { useRouter } from "next/navigation";

// Função para gerar senha aleatória forte
function gerarSenhaAleatoria(tamanho = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Schema Zod (sem password no input do usuário)
const novoFuncionarioSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }).optional(),
  cargo: z.enum([
    "PROFESSOR",
    "RECEPCAO",
    "ADMINISTRATIVO",
    "TREINADOR",
    "GERENTE",
  ], { message: "Cargo inválido" }),
  salario: z.number().positive({ message: "Salário deve ser positivo" }).optional(),
  observacoes: z.string().optional(),
  fotoUrl: z.string().url({ message: "URL da foto inválida" }).optional(),

  // Email obrigatório (login será criado com senha gerada automaticamente)
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório para criar o login" }),
});

type FormData = z.infer<typeof novoFuncionarioSchema>;

const NovoFuncionarioPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(novoFuncionarioSchema),
    defaultValues: {
      cargo: "TREINADOR", // valor padrão útil
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Normaliza email
      data.email = data.email.toLowerCase().trim();

      // Gera senha aleatória automaticamente
      const senhaGerada = gerarSenhaAleatoria(12);

      // Payload enviado ao backend
      const payload = {
        nome: data.nome,
        telefone: data.telefone,
        cargo: data.cargo,
        salario: data.salario,
        observacoes: data.observacoes,
        fotoUrl: data.fotoUrl,
        email: data.email,
        password: senhaGerada, // senha gerada automaticamente
      };

      console.log("[Criar Funcionário + Login Auto] Enviando:", payload);

      const response = await api.post('/tenant/funcionarios', payload);

      toast.success("Funcionário criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p className="font-medium">Funcionário adicionado com login gerado automaticamente.</p>
            
            <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
              <p className="font-semibold mb-1">Dados do login criado:</p>
              <div className="space-y-1">
                <p><span className="font-medium">Nome:</span> {data.nome || "Não informado"}</p>
                <p><span className="font-medium">E-mail (usuário):</span> {data.email || "Não gerado"}</p>
                <p className="font-bold text-blue-700">
                  <span className="font-medium">Senha temporária:</span> {senhaGerada}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Copie a senha e envie ao funcionário imediatamente. Ele deve trocar no primeiro acesso.
            </p>
          </div>
        ),
        duration: 30000, // tempo suficiente para copiar
        action: {
          label: "Copiar senha",
          onClick: () => {
            navigator.clipboard.writeText(senhaGerada);
            toast("Senha copiada para a área de transferência!");
          },
        },
      });

      // Redireciona automaticamente após 2 segundos
      setTimeout(() => {
        router.push("/funcionario");
      }, 2000);

    } catch (error: any) {
      console.error("[Criar Funcionário + Login Auto] Erro:", error);
      toast.error("Erro ao criar funcionário", {
        description: error.response?.data?.error ||
                      error.response?.data?.details?.[0]?.message ||
                      error.message ||
                      "Verifique os dados e tente novamente",
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
          <Link href="/funcionario">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Funcionário</h1>
          <p className="text-gray-600">Preencha os dados do funcionário</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dados do Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="Lucas Silva Santos" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Controller
                name="cargo"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                      <SelectItem value="RECEPCAO">Recepção</SelectItem>
                      <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                      <SelectItem value="TREINADOR">Treinador</SelectItem>
                      <SelectItem value="GERENTE">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cargo && <p className="text-sm text-red-600">{errors.cargo.message}</p>}
            </div>

            {/* Salário */}
            <div className="space-y-2">
              <Label htmlFor="salario">Salário (opcional)</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                placeholder="R$ 3.500,00"
                {...register("salario", { valueAsNumber: true })}
              />
              {errors.salario && <p className="text-sm text-red-600">{errors.salario.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <InputTelefone id="telefone" placeholder="(81) 99999-8888" {...register("telefone")} />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* E-mail (obrigatório para login) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="funcionario@escolinha.com"
                  className="pl-12 h-12"
                  {...register("email", {
                    onChange: (e) => {
                      const lower = e.target.value.toLowerCase();
                      e.target.value = lower;
                      setValue("email", lower);
                    },
                  })}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">O login será criado automaticamente e a senha gerada será exibida após o cadastro</p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Horário de trabalho, especialidade, etc..."
                className="resize-none"
                rows={4}
                {...register("observacoes")}
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
                    Criando funcionário...
                  </>
                ) : (
                  "Criar Funcionário"
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/funcionario">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default NovoFuncionarioPage;