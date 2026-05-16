/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, ChevronLeft, Loader2, Trash2, UserPlus } from "lucide-react";

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

const formSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  dataNascimento: z.string().min(10, "Data de nascimento é obrigatória"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  responsavelId: z.string().optional(),
  email: z.string().email("E-mail do aluno é obrigatório"),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoAlunoPage = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedName = watch("nome");

  const { data: responsaveis = [] } = useQuery({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      const res = await api.get("/tenant/responsaveis");
      return res.data.data || [];
    },
  });

  // ==================== 1. Criar Aluno====================
  const createAlunoMutation = useMutation({
   mutationFn: async (data: FormData) => {
      const formData = new FormData();

      formData.append("nome", data.nome.trim());
      formData.append("dataNascimento", data.dataNascimento.split('/').reverse().join('-'));
      formData.append("telefone", data.telefone.trim());
      formData.append("cpf", data.cpf ? data.cpf.replace(/\D/g, "") : "");
      formData.append("categoria", data.categoria.trim());
      formData.append("responsavelId", data.responsavelId && data.responsavelId !== "none" ? data.responsavelId : "");
      formData.append("email", data.email.trim().toLowerCase());
      formData.append("status", "ATIVO");
      formData.append("observacoes", data.observacoes?.trim() || "");

      // Adiciona a foto se existir
      if (selectedFile) {
        formData.append("foto", selectedFile);
        console.log("📸 Foto incluída no FormData:", selectedFile.name);
      }

      console.log("📤 Enviando FormData completo...");

      const response = await api.post(
    "/tenant/alunos",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

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
      console.error("❌ Erro completo:", err.response?.data || err);
      toast.error(err.response?.data?.error || "Erro ao criar aluno");
    },
  });

  const onSubmit = (data: FormData) => {
    createAlunoMutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto */}
             {/* Foto */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                <AvatarImage src={previewUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                  {watchedName ? watchedName.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => document.getElementById("foto-input")?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Escolher Foto
                </Button>

                {previewUrl && (
                  <Button type="button" variant="destructive" onClick={handleRemoveImage}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500">A foto será enviada após a criação do aluno</p>
            </div>

            {/* Formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input placeholder="Nome completo" {...register("nome")} />
                {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Data de nascimento *</Label>
                <InputData placeholder="dd/mm/aaaa" {...register("dataNascimento")} />
                {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Telefone *</Label>
                <InputTelefone {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>CPF</Label>
                <InputCPF {...register("cpf")} />
              </div>

              <div className="space-y-2">
                <Label>E-mail do aluno *</Label>
                <Input type="email" placeholder="aluno@email.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
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

            <div className="space-y-2">
              <Label>Responsável (opcional)</Label>
              <Controller
                name="responsavelId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
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

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Alergias, restrições..." {...register("observacoes")} />
            </div>

            <div className="flex gap-4 pt-8">
              <Button type="submit" disabled={createAlunoMutation.isPending} className="flex-1">
                {createAlunoMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Aluno...
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
};

export default NovoAlunoPage;