// src/app/(dashboard)/responsaveis/novo/page.tsx
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
  name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório para envio do login" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoResponsavelPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simulação de criação do responsável
      await new Promise(resolve => setTimeout(resolve, 1500));

      const responsavelIdSimulado = Math.floor(Math.random() * 10000) + 1000;
      const username = data.email.split("@")[0].toLowerCase() + "." + responsavelIdSimulado; // ex: maria.1234
      const senhaTemporaria = gerarSenhaAleatoria(10);

      // Simulação de criação de usuário e envio de e-mail
      console.log("=== RESPONSÁVEL CADASTRADO COM SUCESSO (MOCK) ===");
      console.log("Dados:", data);
      console.log("\n--- USUÁRIO CRIADO AUTOMATICAMENTE ---");
      console.log(`Username: ${username}`);
      console.log(`Senha temporária: ${senhaTemporaria}`);
      console.log(`Role: RESPONSAVEL`);
      console.log(`ID simulado: ${responsavelIdSimulado}`);
      console.log("\n--- E-MAIL DE BOAS-VINDAS ENVIADO ---");
      console.log(`Para: ${data.email}`);
      console.log(`Assunto: Bem-vindo ao FutElite, ${data.name.split(" ")[0]}!`);
      console.log(`
Olá ${data.name},

Você foi cadastrado como responsável no portal FutElite.

Acesse com:
Link: https://app.futelite.com/login
Usuário: ${username}
Senha temporária: ${senhaTemporaria}

No primeiro acesso, troque a senha para maior segurança.

Você poderá ver os filhos matriculados, pagamentos, comunicados e mais.

Qualquer dúvida, entre em contato!

Equipe FutElite ⚽
      `);

      toast.success("Responsável criado com sucesso!", {
        description: "Login gerado automaticamente e 'enviado' por e-mail (veja no console)",
      });
    } catch (error) {
      toast.error("Erro ao criar responsável");
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
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" placeholder="Maria Oliveira Santos" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* E-mail (obrigatório para login) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" placeholder="maria@email.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">O login do responsável será enviado para este e-mail</p>
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
              <Input id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
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