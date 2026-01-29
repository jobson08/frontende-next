/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Trash2, Camera, CalendarIcon, UserPlus, AlertCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";
import { format } from "date-fns";

import InputDataEdit from "@/src/components/common/inputsEdit/InputDataEdit";
import InputTelefoneEdit from "@/src/components/common/inputsEdit/InputTelefoneEdit";
import InputCPFEdit from "@/src/components/common/inputsEdit/InputCPFEdit";
import { Controller } from "react-hook-form";

// Schema Zod para edição
const formSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  dataNascimento: z.string().min(10, "Data de nascimento é obrigatória (dd/mm/aaaa)"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  cpf: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  responsavelId: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  status: z.enum(["ATIVO", "INATIVO", "TRANCADO"]),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Interface do aluno retornada pelo backend
interface AlunoDetalhe {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone: string | null;
  cpf: string | null;
  categoria: string;
  responsavelId: string | null;
  email: string | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  observacoes: string | null;
  userId: string | null;
  fotoUrl?: string | null;
  responsavel?: { nome: string; telefone: string | null; email: string | null } | null;
}

// Interface para lista de responsáveis
interface Responsavel {
  id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
}

const EditarAlunoPage = () => {
 const { id } = useParams();
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

const {
  register,
  handleSubmit,
  setValue,
  watch,
  control,           // ← OBRIGATÓRIO
  formState: { errors, isValid },
} = useForm<FormData>({
  resolver: zodResolver(formSchema),
  mode: "onChange",
});

  const watchedName = watch("nome");

  // Busca detalhes do aluno
  const { data: aluno, isLoading: isLoadingAluno, error: errorAluno } = useQuery<AlunoDetalhe>({
    queryKey: ["aluno", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Busca lista de responsáveis reais
  const { data: responsaveis = [], isLoading: isLoadingResponsaveis } = useQuery<Responsavel[]>({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      const res = await api.get("/tenant/responsaveis");
      return res.data.data || [];
    },
  });

  // Pré-preenche o form quando os dados do aluno chegam
  useEffect(() => {
if (aluno && aluno.dataNascimento) {
    // Separa a data ISO ou string
    const [ano, mes, dia] = aluno.dataNascimento.split("T")[0].split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    setDate(new Date(`${ano}-${mes}-${dia}`)); // cria Date sem hora/fuso
      setPhotoPreview(aluno.fotoUrl || null);

      setValue("nome", aluno.nome);
      setValue("dataNascimento", dataFormatada);
      setValue("telefone", aluno.telefone || "");
      setValue("cpf", aluno.cpf || "");
      setValue("categoria", aluno.categoria || "");
      setValue("responsavelId", aluno.responsavelId || "" as string | undefined);
      setValue("email", aluno.email || "");
      setValue("status", aluno.status);
      setValue("observacoes", aluno.observacoes || "");
    }
  }, [aluno, setValue]);

  // Mutation para atualizar aluno
const updateMutation = useMutation({
  mutationFn: async (data: FormData) => {
    console.log("=== [UPDATE] Iniciando salvamento do aluno ===");
    console.log("ID do aluno:", id);
    console.log("Dados do form (data):", data);

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
      responsavelId: data.responsavelId === "none" ? null : data.responsavelId,
      email: data.email?.toLowerCase().trim() || null,
      status: data.status,
      observacoes: data.observacoes?.trim() || null,
    };

    console.log("Payload que será enviado:");
    console.log(JSON.stringify(payload, null, 2));

    const url = `/tenant/alunos/${id}`;
    console.log("URL completa chamada:", api.getUri() + url);  // mostra baseURL + caminho

    try {
      const res = await api.patch(url, payload);
      console.log("Resposta de SUCESSO do PATCH:");
      console.log("Status:", res.status);
      console.log("Dados retornados:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("=== [UPDATE] ERRO NO PATCH ===");
      console.error("Status do erro:", error.response?.status);
      console.error("URL chamada:", error.config?.url);
      console.error("Método:", error.config?.method);
      console.error("Headers enviados:", error.config?.headers);
      console.error("Payload enviado:", error.config?.data);
      console.error("Resposta do servidor:", error.response?.data);
      console.error("Mensagem do erro:", error.message);
      throw error;
    }
  },

  onSuccess: () => {
    console.log("=== [UPDATE] Sucesso total! ===");
    toast.success("Aluno atualizado com sucesso!");
    setTimeout(() => {
      router.push("/aluno");
    }, 1500);
  },

  onError: (err: any) => {
    console.error("=== [UPDATE] Erro capturado no onError ===");
    console.error("Erro completo:", err);
    console.error("Resposta do erro:", err.response?.data);
    console.error("Mensagem:", err.message);
    toast.error("Erro ao atualizar aluno", {
      description: err.response?.data?.error || err.message || "Tente novamente",
    });
  },
});

  // Mutation para redefinir senha
  const redefinirSenhaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tenant/alunos/${id}/redefinir-senha`);
      return res.data;
    },
    onSuccess: (result) => {
      toast.success("Senha redefinida com sucesso!", {
        description: (
          <div className="space-y-2">
            <p>Nova senha temporária gerada:</p>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-center">
              {result.senhaTemporaria}
            </div>
            <p className="text-xs text-gray-500">
              Copie e envie ao responsável ou ao aluno.
            </p>
          </div>
        ),
        duration: 30000,
        action: {
          label: "Copiar senha",
          onClick: () => {
            navigator.clipboard.writeText(result.senhaTemporaria || "");
            toast("Senha copiada!");
          },
        },
      });
    },
    onError: (err: any) => {
      toast.error("Erro ao redefinir senha", {
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  const redefinirSenha = () => {
    if (confirm("Tem certeza que deseja gerar uma nova senha temporária?")) {
      redefinirSenhaMutation.mutate();
    }
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

 if (isLoadingAluno || isLoadingResponsaveis) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );
}

  if (errorAluno || !aluno) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-red-600">
        <AlertCircle className="h-16 w-16" />
        <h2 className="mt-4 text-2xl font-bold">Aluno não encontrado</h2>
        <Button className="mt-6" asChild>
          <Link href="/aluno">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
 <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aluno">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Aluno</h1>
          <p className="text-gray-600">Atualize as informações de {aluno.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <UserPlus className="h-7 w-7 text-blue-600" />
            Editar Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                <AvatarImage src={photoPreview || aluno.fotoUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
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

              {/* Informações Pessoais */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome completo */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input id="nome" placeholder="Nome completo" {...register("nome")} />
                  {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (opcional)</Label>
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <InputCPFEdit
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={field.value || ""}                  // ← força o valor pré-preenchido
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)} // ← atualiza o form
                      />
                    )}
                  />
                  {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                  <Controller
                    name="dataNascimento"
                    control={control}
                    render={({ field }) => (
                      <InputDataEdit
                        id="dataNascimento"
                        placeholder="dd/mm/aaaa"
                        maxLength={10}
                        value={field.value || ""}                  // ← força o valor pré-preenchido
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Controller
                    name="telefone"
                    control={control}
                    render={({ field }) => (
                      // eslint-disable-next-line react/jsx-no-undef
                      <InputTelefoneEdit
                        id="telefone"
                        placeholder="(xx) xxxxx-xxxx"
                        value={field.value || ""}                  // ← força o valor pré-preenchido
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
                </div>

                {/* E-mail (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="aluno@email.com"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select onValueChange={(value) => setValue("categoria", value)} defaultValue={aluno?.categoria || ""}>
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
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Responsável (opcional)</h3>
              <div className="space-y-2">
                <Label>Responsável</Label>
                {isLoadingResponsaveis ? (
                  <p className="text-sm text-gray-500">Carregando responsáveis...</p>
                ) : (
                 <Select
                  onValueChange={(value) => setValue("responsavelId", value === "none" ? undefined : value)}
                  defaultValue={aluno.responsavelId ?? "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum / Sem responsável</SelectItem>
                    {responsaveis.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                )}
              </div>
            </div>

            {/* Status e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={aluno.status} onValueChange={(value) => setValue("status", value as "ATIVO" | "INATIVO" | "TRANCADO")}>
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
                  placeholder="Alergias, restrições, informações importantes..."
                  {...register("observacoes")}
                />
              </div>
            </div>

            {/* Acesso do Aluno + Redefinir Senha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Acesso do Aluno</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <Label>E-mail (usuário)</Label>
                  <Input value={aluno.email || "Não criado"} disabled />
                </div>

                <div className="self-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={redefinirSenha}
                    disabled={redefinirSenhaMutation.isPending || !aluno.userId}
                  >
                    {redefinirSenhaMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      "Redefinir Senha"
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Ao redefinir, uma nova senha temporária será gerada e exibida abaixo. Envie ao responsável ou aluno.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                type="submit"
                disabled={!isValid || updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
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

export default EditarAlunoPage;