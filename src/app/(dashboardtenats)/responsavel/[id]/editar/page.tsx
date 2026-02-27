/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/responsaveis/[id]/editar/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2, Camera, Trash2, User } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";
import InputCPFEdit from "@/src/components/common/inputsEdit/InputCPFEdit";
import InputTelefoneEdit from "@/src/components/common/inputsEdit/InputTelefoneEdit";
//import InputDataEdit from "@/src/components/common/inputsEdit/InputDataEdit";

// Schema Zod corrigido e alinhado com DTO
const formSchema = z.object({
  nome: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  cpf: z.string().optional(),  // opcional no DTO
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Interface do responsável
interface ResponsavelDetalhe {
  id: string;
  nome: string;
  telefone: string | null;
  cpf: string | null;
  email: string | null;
  observacoes: string | null;
  userId: string | null;
  fotoUrl?: string | null;
}

const EditarResponsavelPage = () => {
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
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedName = watch("nome");

  // Busca o responsável
  const { data: responsavel, isLoading, error } = useQuery<ResponsavelDetalhe>({
    queryKey: ["responsavel", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/responsaveis/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Pré-preenche o form
  useEffect(() => {
    if (responsavel) {
      console.log("Pré-preenchendo responsável:", {
        telefone: responsavel.telefone,
        cpf: responsavel.cpf,
      });

      setPhotoPreview(responsavel.fotoUrl || null);

      setValue("nome", responsavel.nome || "");
      setValue("email", responsavel.email || "");
      setValue("cpf", responsavel.cpf || "");
      setValue("telefone", responsavel.telefone || "");
      setValue("observacoes", responsavel.observacoes || "");
    }
  }, [responsavel, setValue]);

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("=== [UPDATE RESPONSÁVEL] Iniciando salvamento ===");
      console.log("ID:", id);
      console.log("Dados do form:", data);

      const payload = {
        nome: data.nome?.trim(),
        email: data.email?.toLowerCase().trim() || null,
        telefone: data.telefone?.replace(/\D/g, "") || null,
        cpf: data.cpf?.replace(/\D/g, "") || null,
        observacoes: data.observacoes?.trim() || null,
      };

      console.log("=== PAYLOAD ENVIADO ===");
      console.log("URL:", `/tenant/responsavel/${id}`);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const res = await api.patch(`/tenant/responsaveis/${id}`, payload);
      return res.data;
    },

    onSuccess: () => {
      toast.success("Responsável atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["responsavel", id] });
      queryClient.invalidateQueries({ queryKey: ["responsaveis"] });

      setTimeout(() => {
        router.push("/responsavel");  // corrigido para lista
      }, 1500);
    },

    onError: (err: any) => {
      console.error("=== [UPDATE RESPONSÁVEL] Erro ===", err);
      toast.error("Erro ao atualizar responsável", {
        description: err.response?.data?.error || err.message || "Tente novamente",
      });
    },
  });

  // Mutation para redefinir senha
  const redefinirSenhaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tenant/responsaveis/${id}/redefinir-senha`);
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
              Copie e envie ao responsável imediatamente.
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando dados...</span>
      </div>
    );
  }

  if (error || !responsavel) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold">Responsável não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/responsavel">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Editar Responsável</h1>
          <p className="text-gray-600">Atualize as informações de {responsavel.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <User className="h-7 w-7 text-blue-600" />
            Editar Dados do Responsável
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
              <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                <AvatarImage src={photoPreview || responsavel.fotoUrl || undefined} />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
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
                {/* Nome Completo */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input id="nome" placeholder="Nome completo" {...register("nome")} />
                  {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Telefone */}
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
                        value={field.value || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o responsável..."
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Acesso do Responsável + Redefinir Senha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Acesso do Responsável</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <Label>E-mail (usuário)</Label>
                  <Input value={responsavel.email || "Não criado"} disabled />
                </div>

                <div className="self-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={redefinirSenha}
                    disabled={redefinirSenhaMutation.isPending || !responsavel.userId}
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
                Ao redefinir, uma nova senha temporária será gerada automaticamente e exibida abaixo. Envie ao responsável imediatamente.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !isValid}
                className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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

export default EditarResponsavelPage;