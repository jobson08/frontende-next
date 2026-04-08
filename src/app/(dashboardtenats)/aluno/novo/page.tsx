/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, ChevronLeft, Loader2, Trash2, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";
import InputTelefone from "@/src/components/common/InputTelefone";
import InputData from "@/src/components/common/InputData";
import InputCPF from "@/src/components/common/InputCPF";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

/*const ImageUploader = dynamic(
  () => import("@/src/components/ImageUploader"), // Ajuste o caminho se necessário
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-gray-500">Carregando uploader de imagem...</p>
      </div>
    ),
  }
);*/

const formSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  dataNascimento: z.string().min(10, "Data de nascimento é obrigatória"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  responsavelId: z.string().optional(),
  emailAluno: z.string().email("E-mail do aluno é obrigatório"),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoAlunoPage = () => {
const router = useRouter();
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
   // setValue,
    watch,
    control,                    // ← Adicionado
    formState: { errors },
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

  // Mutation - Envia tudo junto (form + foto)
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();

    // Campos do aluno
    formData.append("nome", data.nome.trim());
    formData.append("dataNascimento", data.dataNascimento.split("/").reverse().join("-"));
    formData.append("telefone", data.telefone.trim());
    formData.append("cpf", data.cpf ? data.cpf.replace(/\D/g, "") : "");
    formData.append("categoria", data.categoria.trim());
    formData.append("responsavelId", data.responsavelId && data.responsavelId !== "none" ? data.responsavelId : "");
    formData.append("email", data.emailAluno.trim().toLowerCase());
    formData.append("status", "ATIVO");
    formData.append("observacoes", data.observacoes?.trim() || "");

    // === FOTO ===
    if (selectedFile) {
      formData.append("foto", selectedFile);
      console.log("✅ Foto adicionada ao FormData:", selectedFile.name, selectedFile.size);
    } else {
      console.log("⚠️ Nenhuma foto selecionada");
    }

    // Debug completo do FormData
    console.log("📋 Conteúdo do FormData enviado:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   ${key} → FILE: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`   ${key} → ${value}`);
      }
    }

    const response = await api.post("/tenant/alunos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("📥 Resposta do backend:", response.data);
    return response.data;
  },

    onSuccess: (result) => {
      toast.success("Aluno criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p>Aluno adicionado à escolinha.</p>
            <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
              <p><strong>Nome:</strong> {result.nome || "Não informado"}</p>
              <p><strong>E-mail:</strong> {result.email || "Não gerado"}</p>
              {result.senhaTemporaria && (
                <p><strong>Senha temporária:</strong> {result.senhaTemporaria}</p>
              )}
            </div>
          </div>
        ),
        duration: 35000,
        action: {
          label: "Copiar senha",
          onClick: () => {
            if (result.senhaTemporaria) {
              navigator.clipboard.writeText(result.senhaTemporaria);
              toast("Senha copiada!");
            }
          },
        },
      });

      setTimeout(() => router.push("/aluno"), 1800);
    },

    onError: (err: any) => {
      console.error("❌ Erro ao criar aluno:", err.response?.data || err);
      toast.error("Erro ao cadastrar aluno", {
        description: err.response?.data?.error || err.message || "Tente novamente",
      });
    },
  });

    const handleImageChange = (file: File | null, url?: string) => {
  setSelectedFile(file);
  if (url) setCurrentImageUrl(url);
  console.log("📸 Imagem selecionada:", file?.name);
};

  const handleRemoveImage = () => {
  setSelectedFile(null);
  setCurrentImageUrl(null);
  console.log("🗑️ Imagem removida");
};

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aluno">
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
          {createMutation.isPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center mb-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-blue-800">Criando aluno... Aguarde</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ImageUploader */}
            {/* Foto - Versão Simples e Eficiente */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                  <AvatarImage src={currentImageUrl || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {watchedName ? watchedName.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => document.getElementById("foto-input")?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Adicionar foto
                </Button>

                {currentImageUrl && (
                  <Button type="button" variant="destructive" onClick={() => {
                    setSelectedFile(null);
                    setCurrentImageUrl(null);
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setCurrentImageUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" placeholder="Nome completo" {...register("nome")} />
                {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <InputCPF id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <InputTelefone
                  id="telefone"
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

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
            <Controller
              name="categoria"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
                {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
              </div>
            </div>

          {/* Responsável */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Responsável (opcional)</h3>
            <div className="space-y-2">
              <Label>Responsável existente</Label>
              <Controller
                name="responsavelId"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}   // ← importante
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opção "Nenhum" sem value vazio */}
                      <SelectItem value="none">Nenhum / Sem responsável</SelectItem>
                      
                      {responsaveis.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Alergias, restrições, informações importantes..."
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
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

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default NovoAlunoPage;