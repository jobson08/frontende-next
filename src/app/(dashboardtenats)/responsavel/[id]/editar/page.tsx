/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/responsaveis/[id]/editar/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2, Save, Lock } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { useEffect } from "react";
import InputTelefoneEdit from "@/src/components/common/inputsEdit/InputTelefoneEdit";
import InputCPFEdit from "@/src/components/common/inputsEdit/InputCPFEdit";
import { Controller } from "react-hook-form";

// Schema Zod (alinhado com o DTO do backend)
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).optional(),
  telefone: z.string().min(10, { message: "Telefone inválido" }).optional(),
  cpf: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditarResponsavelPage = () => {
  const params = useParams();
  const responsavelId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  // Busca o responsável real
  const { data: responsavel, isLoading, error } = useQuery({
    queryKey: ["responsavel", responsavelId],
    queryFn: async () => {
      const { data } = await api.get(`/tenant/responsaveis/${responsavelId}`);
      return data.data;
    },
    enabled: !!responsavelId,
  });

  // Pré-preenche os campos quando os dados chegam
  useEffect(() => {
    if (responsavel) {
     console.log("Pré-preenchendo responsável:", {
        telefone: responsavel.telefone,
        cpf: responsavel.cpf,
      });

      setValue("nome", responsavel.nome || "");
      setValue("email", responsavel.email || "");
      setValue("telefone", responsavel.telefone || "");
      setValue("cpf", responsavel.cpf || "");
      setValue("observacoes", responsavel.observacoes || "");
    }
  }, [responsavel, setValue]);

  // Mutation para atualizar
  const updateMutation = useMutation({
   mutationFn: async (data: FormData) => {
      console.log("=== [UPDATE RESPONSÁVEL] Iniciando ===");
      console.log("ID:", responsavelId);
      console.log("Dados do form:", data);

      const payload = {
        nome: data.nome.trim(),
        email: data.email?.toLowerCase().trim() || null,
        telefone: data.telefone?.replace(/\D/g, "") || null,  // limpa máscara
        cpf: data.cpf?.replace(/\D/g, "") || null,            // limpa máscara
        observacoes: data.observacoes?.trim() || null,
      };

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      // ROTA CORRIGIDA: PUT + sem /tenant (baseado nas rotas que você enviou)
      const url = `/tenant/responsaveis/${responsavelId}`;
      console.log("URL completa:", api.getUri() + url);

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
      toast.success("Responsável atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["responsavel", responsavelId] });
      queryClient.invalidateQueries({ queryKey: ["responsaveis"] });
      router.push("/responsavel");
    },
    onError: (err: any) => {
    console.error("=== [UPDATE] Erro capturado no onError ===");
    console.error("Erro completo:", err);
    console.error("Resposta do erro:", err.response?.data);
    console.error("Mensagem:", err.message);
      toast.error("Erro ao atualizar responsável", {
        description: err.response?.data?.error || err.message || "Tente novamente",
      });
    },
  });

  // Mutation para redefinir senha
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(`/tenant/responsaveis/${responsavelId}/reset-password`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Nova senha gerada com sucesso!", {
        description: (
          <div className="space-y-1">
            <p>Nova senha temporária: <strong className="font-mono">{data.novaSenha}</strong></p>
            <p className="text-xs text-gray-500 mt-2">
              Copie e envie para o responsável. Ele deve trocar no primeiro acesso.
            </p>
          </div>
        ),
        duration: 15000,
      });
    },
    onError: (err: any) => {
      toast.error("Erro ao redefinir senha", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          <Link href="/responsaveis">Voltar para lista</Link>
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
          <CardTitle className="text-2xl">Editar Dados do Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">
            {/* Informações Pessoais */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" placeholder="Maria Oliveira Santos" {...register("nome")} />
                  {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="maria@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Controller
                    name="telefone"
                    control={control}
                    render={({ field }) => (
                      <InputTelefoneEdit
                        id="telefone"
                        placeholder="(11) 97777-6666"
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
                        value={field.value || ""}                  // ← força o valor pré-preenchido
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)} // ← atualiza o form
                      />
                    )}
                  />
                  {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Observações</h3>
              <Textarea
                id="observations"
                placeholder="Informações adicionais sobre o responsável..."
                className="resize-none min-h-32"
                rows={5}
                {...register("observacoes")}
              />
            </div>

            {/* Acesso do Responsável + Redefinir Senha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Acesso do Responsável</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>E-mail</Label>
                  <Input value={responsavel.email || "Não criado"} disabled />
                </div>
                <div className="self-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetPasswordMutation.mutate()}
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Ao redefinir, uma nova senha temporária será gerada e exibida aqui.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                <Link href="/responsavel">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarResponsavelPage;