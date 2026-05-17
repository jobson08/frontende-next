/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { ChevronLeft, Loader2, Mail, UserPlus, Camera, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";
import InputTelefone from "@/src/components/common/InputTelefone";
import InputCPF from "@/src/components/common/InputCPF";
import { useMutation } from "@tanstack/react-query";

// Schema Zod aprimorado
const novoFuncionarioSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  cargo: z.enum(["PROFESSOR", "RECEPCAO", "ADMINISTRATIVO", "TREINADOR", "GERENTE"], {
    message: "Selecione um cargo válido",
  }),
  salario: z
    .number()
    .positive("Salário deve ser maior que zero")
    .nullable()
    .optional(),
  observacoes: z.string().optional(),
  email: z
    .string()
    .email("E-mail inválido")
    .min(1, "E-mail é obrigatório"),
});

type FormData = z.infer<typeof novoFuncionarioSchema>;

const NovoFuncionarioPage = () => {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(novoFuncionarioSchema),
    defaultValues: {
      cargo: "TREINADOR",
      salario: null,
    },
  });

  const watchedName = watch("nome");

  // Mutation para criar funcionário
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();

      formData.append("nome", data.nome.trim());
      formData.append("cargo", data.cargo);
      formData.append("email", data.email.trim().toLowerCase());

      // Campos opcionais
      if (data.salario !== undefined && data.salario !== null) {
        formData.append("salario", data.salario.toString());
      }
      if (data.telefone?.trim()) {
        formData.append("telefone", data.telefone.trim());
      }
      if (data.cpf?.trim()) {
        formData.append("cpf", data.cpf.replace(/\D/g, ""));
      }
      if (data.observacoes?.trim()) {
        formData.append("observacoes", data.observacoes.trim());
      }

      // Foto
      if (selectedFile) {
        formData.append("foto", selectedFile);
        console.log("✅ Foto adicionada:", selectedFile.name);
      } else {
        console.log("⚠️ Nenhuma foto selecionada");
      }

      // Debug do FormData
      console.log("📋 FormData enviado:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`   ${key} → FILE: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`   ${key} → ${value}`);
        }
      }

      const response = await api.post("/tenant/funcionarios", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },

    onSuccess: (result) => {
      toast.success("Funcionário criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p>Funcionário adicionado à escolinha.</p>
            <div className="bg-gray-100 p-3 rounded-md border border-gray-300">
              <p><strong>Nome:</strong> {result.data?.nome || result.nome}</p>
              <p><strong>E-mail:</strong> {result.data?.email || result.email}</p>
              {result.senhaTemporaria && (
                <p><strong>Senha temporária:</strong> {result.senhaTemporaria}</p>
              )}
            </div>
          </div>
        ),
        duration: 40000,
        action: {
          label: "Copiar senha",
          onClick: () => {
            if (result.senhaTemporaria) {
              navigator.clipboard.writeText(result.senhaTemporaria);
              toast.success("Senha copiada para a área de transferência!");
            }
          },
        },
      });

      // Redireciona após sucesso
      setTimeout(() => {
        router.push("/funcionario");
      }, 2000);
    },

    onError: (err: any) => {
      console.error("❌ Erro ao criar funcionário:", err.response?.data || err);

      const serverError = err.response?.data?.error || err.message || "Erro desconhecido";

      if (err.response?.status === 409) {
        toast.error("E-mail já cadastrado", { description: serverError });
      } else if (err.response?.status === 400) {
        toast.error("Dados inválidos", { description: serverError });
      } else {
        toast.error("Falha ao cadastrar funcionário", { description: serverError });
      }
    },
  });

  // Handler para seleção de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Remover imagem
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/funcionario">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Funcionário</h1>
          <p className="text-gray-600">Preencha os dados abaixo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Dados do Funcionário
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                placeholder="Ex: Breno Silva Santos"
                {...register("nome")}
              />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <InputCPF
                id="cpf"
                placeholder="123.456.789-00"
                {...register("cpf")}
              />
              {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
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
              <Controller
                name="salario"
                control={control}
                render={({ field }) => (
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    placeholder="3500.00"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : parseFloat(val));
                    }}
                  />
                )}
              />
              {errors.salario && <p className="text-sm text-red-600">{errors.salario.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <InputTelefone
                id="telefone"
                placeholder="(81) 98765-4321"
                {...register("telefone")}
              />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="funcionario@escolinha.com"
                  className="pl-12"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">
                O login será criado automaticamente com uma senha temporária.
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Horário de trabalho, especialidades, informações adicionais..."
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {createMutation.isPending ? (
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