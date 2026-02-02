/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit/novo/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Loader2, UserPlus, Mail, Phone, Calendar, Camera, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";
import InputCPF from "@/src/components/common/InputCPF";
import InputTelefone from "@/src/components/common/InputTelefone";
import InputData from "@/src/components/common/InputData";

// Função para gerar senha aleatória (igual ao responsável)
function gerarSenhaAleatoria(tamanho = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Schema Zod (alinhado com o DTO do backend)
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório para envio do login" }),
  cpf: z.string().optional(),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  dataNascimento: z.string().min(10, { message: "Data de nascimento obrigatória (dd/mm/aaaa)" }),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoAlunoCrossfitPage = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedName = watch("nome");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Normaliza e-mail
      data.email = data.email.toLowerCase().trim();

      // Gera senha temporária
      const senhaTemporaria = gerarSenhaAleatoria(10);

      // Prepara payload limpo
      const payload = {
        nome: data.nome.trim(),
        email: data.email,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        dataNascimento: data.dataNascimento
          ? data.dataNascimento.split("/").reverse().join("-")
          : null,
        observacoes: data.observacoes?.trim() || null,
        password: senhaTemporaria,
      };

      console.log("=== PAYLOAD ENVIADO AO BACKEND ===");
      console.log("URL chamada:", "/tenant/alunos-crossfit");
      console.log("Payload completo:", JSON.stringify(payload, null, 2));

      // Envia para o backend
      const response = await api.post('/tenant/alunos-crossfit', payload);

      toast.success("Aluno CrossFit criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p className="font-medium">Aluno adicionado com login gerado.</p>
            
            <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
              <p className="font-semibold mb-1">Dados do login criado:</p>
              <div className="space-y-1">
                <p><span className="font-medium">Nome do aluno:</span> {data.nome || "Não informado"}</p>
                <p><span className="font-medium">E-mail (usuário):</span> {data.email || "Não gerado"}</p>
                <p className="font-bold text-blue-700">
                  <span className="font-medium">Senha temporária:</span> {senhaTemporaria || "Gerada automaticamente"}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Copie a senha e envie ao aluno imediatamente. Ele deve trocar no primeiro acesso.
            </p>
          </div>
        ),
        duration: 30000, // tempo suficiente para copiar
        action: {
          label: "Copiar senha",
          onClick: () => {
            navigator.clipboard.writeText(senhaTemporaria || "");
            toast("Senha copiada para a área de transferência!");
          },
        },
      });

      // Redireciona automaticamente para a lista após 2 segundos
      setTimeout(() => {
        router.push("/crossfit");  // ← lista de alunos CrossFit
      }, 2000);

    } catch (error: any) {
      console.error("[Criar Aluno CrossFit] Erro:", error);
      toast.error("Erro ao criar aluno CrossFit", {
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
          <Link href="/crossfit">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Aluno CrossFit</h1>
          <p className="text-gray-600">Preencha os dados do novo aluno adulto</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-red-600" />
            Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Foto */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                <AvatarImage src={photoPreview || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-3xl font-bold">
                  {watchedName ? watchedName.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Escolher foto
                </Button>
                {photoPreview && (
                  <Button type="button" variant="destructive" size="sm" onClick={removePhoto}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="ex: Carlos Silva" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* E-mail (obrigatório para login) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="carlos@email.com"
                {...register("email", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                    setValue("email", e.target.value);
                  },
                })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">O login será criado automaticamente e enviado para este e-mail</p>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <InputCPF id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
              {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <InputTelefone id="telefone" placeholder="(11) 97777-6666" {...register("telefone")} />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento *</Label>
              <InputData 
                id="dataNascimento" 
                placeholder="dd/mm/aaaa" 
                maxLength={10} 
                {...register("dataNascimento")} 
              />
              {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="ex: Cliente tem experiência em CrossFit e prefere turmas avançadas"
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
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando aluno...
                  </>
                ) : (
                  "Criar Aluno CrossFit"
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/crossfit">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default NovoAlunoCrossfitPage;