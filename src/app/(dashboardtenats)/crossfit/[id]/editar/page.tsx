/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit/[id]/editar/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2, Save, Camera, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Controller } from "react-hook-form";
import api from "@/src/lib/api";
import InputCPFEdit from "@/src/components/common/inputsEdit/InputCPFEdit";
import InputTelefoneEdit from "@/src/components/common/inputsEdit/InputTelefoneEdit";
import InputDataEdit from "@/src/components/common/inputsEdit/InputDataEdit";

// Schema Zod (alinhado com o DTO de atualização)
const formSchema = z.object({
  nome: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  dataNascimento: z.string().min(10, "Data de nascimento é obrigatória (dd/mm/aaaa)"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  observacoes: z.string().max(1000).optional(),
  frequencia: z.number()
    .int("Frequência deve ser um número inteiro")
    .min(0, "Mínimo 0")
    .max(7, "Máximo 7")
    .optional(),
  status: z.enum(["ativo", "inativo", "trancado"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditarAlunoCrossfitPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedName = watch("nome");

  // Busca dados do aluno
  const { data: aluno, isLoading, error } = useQuery({
    queryKey: ["aluno-crossfit", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos-crossfit/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Pré-preenche o form quando os dados chegam
  useEffect(() => {
    if (aluno && aluno.dataNascimento) {
    // Separa a data ISO ou string
    const [ano, mes, dia] = aluno.dataNascimento.split("T")[0].split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;


      setValue("nome", aluno.nome || "");
      setValue("email", aluno.email || "");
      setValue("cpf", aluno.cpf || "");
      setValue("telefone", aluno.telefone || "");
      setValue("dataNascimento", dataFormatada);
      setValue("observacoes", aluno.observacoes || "");
      setValue("frequencia", aluno.frequencia || 0);
      setValue("status", aluno.status || "ativo");
    }
  }, [aluno, setValue]);

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

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        nome: data.nome?.trim(),
        email: data.email?.toLowerCase().trim(),
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        dataNascimento: data.dataNascimento
        ? data.dataNascimento.split("/").reverse().join("-")
        : null,
        observacoes: data.observacoes?.trim(),
        frequencia: data.frequencia,
        status: data.status,
      };

      console.log("=== PAYLOAD ENVIADO AO BACKEND ===");
      console.log("URL chamada:", `/tenant/alunos-crossfit/${id}`);
      console.log("Payload completo:", JSON.stringify(payload, null, 2));

      const res = await api.patch(`/tenant/alunos-crossfit/${id}`, payload);
      console.log("Resposta do backend:", res.data);
      return res.data;
    },

    onSuccess: () => {
      toast.success("Aluno CrossFit atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["aluno-crossfit", id] });
      queryClient.invalidateQueries({ queryKey: ["alunos-crossfit"] });

      setTimeout(() => {
        router.push("/crossfit");
      }, 2000);
    },

    onError: (err: any) => {
      console.error("Erro ao atualizar aluno CrossFit:", err);
      toast.error("Erro ao atualizar aluno", {
        description: err.response?.data?.error || err.message || "Tente novamente",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <span className="ml-4 text-xl">Carregando dados do aluno...</span>
      </div>
    );
  }

  if (error || !aluno) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold">Aluno não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/crossfit">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Editar Aluno CrossFit</h1>
          <p className="text-gray-600">Atualize as informações de {aluno.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <UserPlus className="h-7 w-7 text-red-600" />
            Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          {updateMutation.isPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center mb-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-blue-800">Salvando alterações... Aguarde</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-red-100">
                <AvatarImage src={photoPreview || aluno.fotoUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-3xl font-bold">
                  {watchedName ? watchedName.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Alterar foto
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

            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" placeholder="Nome completo" {...register("nome")} />
                {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" placeholder="aluno@email.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <InputCPFEdit
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={field.value || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone (opcional)</Label>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <InputTelefoneEdit
                      id="telefone"
                      placeholder="(xx) xxxxx-xxxx"
                      value={field.value || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                <Controller
                  name="dataNascimento"
                  control={control}
                  render={({ field }) => (
                    <InputDataEdit
                      id="dataNascimento"
                      placeholder="dd/mm/aaaa"
                      value={field.value || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Alergias, restrições, preferências de turma..."
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isSubmitting || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>

              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/crossfit">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarAlunoCrossfitPage;