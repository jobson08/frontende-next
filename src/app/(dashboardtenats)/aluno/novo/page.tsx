/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/alunos/novo/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2, UserPlus, Camera, Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import InputTelefone from "@/src/components/common/InputTelefone";
import InputCPF from "@/src/components/common/InputCPF";
import InputData from "@/src/components/common/InputData";
import api from "@/src/lib/api";

// Schema Zod - aceita STRING para dataNascimento
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),

  dataNascimento: z.string()
    .min(1, { message: "Data de nascimento é obrigatória" })
    .refine((val) => {
      const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$|^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
      return regex.test(val);
    }, { message: "Formato de data inválido (use dd/MM/yyyy)" }),

  telefone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  responsavelId: z.string().optional(),
  emailResponsavel: z.string().email({ message: "E-mail inválido" }).optional(),
  status: z.enum(["ATIVO", "INATIVO", "TRANCADO"]),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoAlunoPage = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "ATIVO",
    },
  });

  const watchedName = watch("nome");

  // Busca responsáveis reais
  const { data: responsaveis = [], isLoading: loadingResponsaveis } = useQuery({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      const { data } = await api.get("/tenant/responsaveis"); // ← rota completa
      return data.data || [];
    },
  });

  // Preenche email ao selecionar responsável
  const handleResponsavelChange = (value: string) => {
    setValue("responsavelId", value);

    const responsavelSelecionado = responsaveis.find((r: any) => r.id === value);
    if (responsavelSelecionado?.email) {
      setValue("emailResponsavel", responsavelSelecionado.email);
    } else {
      setValue("emailResponsavel", "");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

 const createMutation = useMutation({
  mutationFn: async (data: FormData) => {
    // Converte dataNascimento de "dd/MM/yyyy" para "YYYY-MM-DD"
    let dataNascimentoISO: string;

    if (!data.dataNascimento) {
      throw new Error("Data de nascimento é obrigatória");
    }

    try {
      const [day, month, year] = data.dataNascimento.split("/").map(Number);
      if (!day || !month || !year) throw new Error("Formato inválido");

      dataNascimentoISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } catch {
      throw new Error("Data de nascimento inválida");
    }

    const payload = {
      ...data,
      dataNascimento: dataNascimentoISO, // sempre string (nunca null)
    };

    const response = await api.post('/api/v1/tenant/alunos', payload);
    return response.data;
  },
  onSuccess: (result) => {
    toast.success("Aluno criado com sucesso!", {
      description: "Aluno adicionado à escolinha.",
    });
  },
  onError: (err: any) => {
    toast.error("Erro ao criar aluno", {
      description: err.message || err.response?.data?.error || "Tente novamente",
    });
  },
});

const onSubmit = async (data: FormData) => {
  console.log("Dados enviados:", data);
  setIsSubmitting(true);
  createMutation.mutate(data);
};

  return (
    <>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        {/* Cabeçalho */}
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
              {/* Foto do Aluno */}
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
                <p className="text-xs text-gray-500 text-center">Foto opcional (JPG, PNG até 5MB)</p>
              </div>

              {/* Informações Pessoais */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" placeholder="Enzo Gabriel Silva" {...register("nome")} />
                    {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                    <InputData id="dataNascimento" {...register("dataNascimento")} />
                    {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <InputTelefone id="telefone" placeholder="(11) 98888-7777" {...register("telefone")} />
                    {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <InputCPF id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria *</Label>
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
              </div>

              {/* Responsável */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Responsável</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Responsável existente</Label>
                    {loadingResponsaveis ? (
                      <p className="text-sm text-gray-500">Carregando responsáveis...</p>
                    ) : (
                      <Select onValueChange={handleResponsavelChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um responsável (opcional)" />
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

                  <div className="space-y-2">
                    <Label htmlFor="emailResponsavel">E-mail do responsável *</Label>
                    <Input
                      id="emailResponsavel"
                      type="email"
                      placeholder="responsavel@email.com"
                      {...register("emailResponsavel")}
                      disabled
                    />
                    {errors.emailResponsavel && <p className="text-sm text-red-600">{errors.emailResponsavel.message}</p>}
                    <p className="text-xs text-gray-500">Preenchido automaticamente ao selecionar o responsável</p>
                  </div>
                </div>
              </div>

              {/* Status e Observações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Status inicial</Label>
                  <Select defaultValue="ATIVO" onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                      <SelectItem value="TRANCADO">Trancado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Alergias, restrições médicas, informações importantes sobre o aluno..."
                    className="resize-none min-h-32"
                    rows={5}
                    {...register("observacoes")}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
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
};

export default NovoAlunoPage;