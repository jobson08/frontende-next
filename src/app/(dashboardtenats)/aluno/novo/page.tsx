/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/alunos/novo/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation"; // ← importado para redirecionar
import Link from "next/link";
import { ChevronLeft, Loader2, UserPlus, Camera, Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";
import InputTelefone from "@/src/components/common/InputTelefone";
import InputData from "@/src/components/common/InputData";
import InputCPF from "@/src/components/common/InputCPF";

// Schema Zod - sem status (sempre ATIVO no backend)
const formSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  dataNascimento: z.string().min(10, "Data de nascimento é obrigatória (dd/mm/aaaa)"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  responsavelId: z.string().optional(),
  emailAluno: z.string().email("E-mail do aluno é obrigatório e válido"),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NovoAlunoPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // ← adicionado para redirecionar

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting: formIsSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedName = watch("nome");

  // Busca responsáveis
  const { data: responsaveis = [], isLoading: loadingResponsaveis } = useQuery({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      const res = await api.get("/tenant/responsaveis");
      return res.data.data || [];
    },
  });

  const handleResponsavelChange = (value: string) => {
    setValue("responsavelId", value);
  };

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

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        nome: data.nome.trim(),
        dataNascimento: data.dataNascimento
          ? data.dataNascimento.split("/").reverse().join("-")
          : null,
        telefone: data.telefone.trim() || null,
       cpf: data.cpf 
      ? data.cpf.replace(/\D/g, "")   // ← remove tudo que não é dígito (pontos, traços, espaços)
      : null,
        categoria: data.categoria.trim(),
        responsavelId: data.responsavelId || null,
        email: data.emailAluno.toLowerCase().trim(),
        status: "ATIVO",
        observacoes: data.observacoes?.trim() || null,
      };

      console.log("=== PAYLOAD ENVIADO AO BACKEND ===");
      console.log("URL chamada:", "/tenant/alunos");
      console.log("Payload completo:", JSON.stringify(payload, null, 2));

      const res = await api.post("/tenant/alunos", payload);
      console.log("Resposta do backend:", res.data);
      return res.data;
    },

    onSuccess: (result) => {
      toast.success("Aluno criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p className="font-medium">Aluno adicionado à escolinha.</p>
            
            <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
              <p className="font-semibold mb-1">Dados do login criado:</p>
              <div className="space-y-1">
                <p><span className="font-medium">Nome do aluno:</span> {result.nome || "Não informado"}</p>
                <p><span className="font-medium">E-mail (usuário):</span> {result.email || "Não gerado"}</p>
                <p className="font-bold text-blue-700">
                  <span className="font-medium">Senha temporária:</span> {result.senhaTemporaria || "Gerada automaticamente"}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Copie a senha temporária e envie ao aluno ou responsável imediatamente. 
              O aluno deve alterar a senha no primeiro acesso.
            </p>
          </div>
        ),
        duration: 30000, // 30 segundos para dar tempo de copiar
        action: {
          label: "Copiar senha",
          onClick: () => {
            navigator.clipboard.writeText(result.senhaTemporaria || "");
            toast("Senha copiada para a área de transferência!");
          },
        },
      });

      // Redireciona para a página de lista de alunos após 2 segundos (tempo para ver o toast)
      setTimeout(() => {
        router.push("/aluno");
      }, 2000);
    },

    onError: (err: any) => {
      console.error("Erro completo:", err.response?.data || err.message);
      toast.error("Erro ao criar aluno", {
        description: err.response?.data?.error || err.message || "Tente novamente",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("=== DADOS DO FORMULÁRIO (antes de enviar) ===");
    console.log("Dados validados:", JSON.stringify(data, null, 2));
    console.log("Form válido?", isValid);
    console.log("Erros atuais:", errors);
    
    createMutation.mutate(data);
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/aluno"> {/* ← corrigido para /alunos */}
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Aluno</h1>
            <p className="text-gray-600">Preencha os dados do novo aluno</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <UserPlus className="h-7 w-7 text-blue-600" />
              Dados do Aluno
            </CardTitle>
          </CardHeader>

          <CardContent>
            {createMutation.isPending ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center mb-6">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-blue-800">Criando aluno... Aguarde</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Foto */}
              <div className="flex flex-col items-center gap-4 py-6 border-b">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
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

              {/* Campos obrigatórios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input id="nome" placeholder="Nome completo" {...register("nome")} />
                  {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF </Label>
                  <InputCPF 
                    id="cpf" 
                    placeholder="000.000.000-00 " 
                    {...register("cpf")} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                  <InputData
                    id="dataNascimento"
                    type="text"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    {...register("dataNascimento")}
                  />
                  {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <InputTelefone
                    id="telefone"
                    type="tel"
                    placeholder="(xx) xxxxx-xxxx"
                    {...register("telefone")}
                  />
                  {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailAluno">E-mail do aluno *</Label>
                  <Input
                    id="emailAluno"
                    type="email"
                    placeholder="aluno@email.com"
                    {...register("emailAluno")}
                  />
                  {errors.emailAluno && <p className="text-sm text-red-600">{errors.emailAluno.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select onValueChange={(value) => setValue("categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sub-9">Sub-9</SelectItem>
                      <SelectItem value="Sub-11">Sub-11</SelectItem>
                      <SelectItem value="Sub-13">Sub-13</SelectItem>
                      <SelectItem value="Sub-15">Sub-15</SelectItem>
                      <SelectItem value="Sub-17">Sub-17</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
                </div>
              </div>

              {/* Responsável - opcional */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Responsável (opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Responsável existente</Label>
                    {loadingResponsaveis ? (
                      <p className="text-sm text-gray-500">Carregando...</p>
                    ) : responsaveis.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum responsável cadastrado</p>
                    ) : (
                      <Select onValueChange={handleResponsavelChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sem responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {responsaveis.map((r: any) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Alergias, restrições, informações extras..."
                  {...register("observacoes")}
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                <Button
                  type="submit"
                  disabled={!isValid || createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando aluno...
                    </>
                  ) : (
                    "Criar Aluno"
                  )}
                </Button>

                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/aluno">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </>
  );
}