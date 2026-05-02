/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/treinador/[id]/editar/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2, Camera, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import api from "@/src/lib/api";
import InputCPFEdit from "@/src/components/common/inputsEdit/InputCPFEdit";
import InputTelefoneEdit from "@/src/components/common/inputsEdit/InputTelefoneEdit";
import InputDataEdit from "@/src/components/common/inputsEdit/InputDataEdit";
import dynamic from "next/dynamic";

// Import dinâmico com suppressHydrationWarning
const ImageUploader = dynamic(
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
);
// Schema Zod completo e corrigido
const formSchema = z.object({
  nome: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  dataNascimento: z.string().min(10, "Data de nascimento é obrigatória (dd/mm/aaaa)"),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  observacoes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Interface do aluno (ajustada)
interface TreinadorDetalhe {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  userId: string | null;
  fotoUrl?: string | null;
}

const EditarTreinadorPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

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

  // Busca dados do treinador
  const { data: treinador, isLoading, error } = useQuery<TreinadorDetalhe>({
    queryKey: ["treinador", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinadores/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Pré-preenche o form
  useEffect(() => {
    if (treinador) {
      const [ano, mes, dia] = treinador.dataNascimento.split("T")[0].split("-");
      const dataFormatada = `${dia}/${mes}/${ano}`;

      setCurrentImageUrl(treinador.fotoUrl || null);
      setSelectedFile(null);
      setIsRemovingImage(false);

      setValue("nome", treinador.nome || "");
      setValue("email", treinador.email || "");
      setValue("telefone", treinador.telefone || "");
      setValue("dataNascimento", dataFormatada);
      setValue("observacoes", treinador.observacoes || "");
    }
  }, [treinador, setValue]);

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let novaFotoUrl = treinador?.fotoUrl || null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await api.post(`/tenant/upload/treinadores/${id}`, formData);
        novaFotoUrl = res.data.url;
      }

      if (isRemovingImage && !selectedFile) {
        novaFotoUrl = null;
      }

      const payload = {
        nome: data.nome?.trim(),
        email: data.email?.toLowerCase().trim(),
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        dataNascimento: data.dataNascimento
          ? data.dataNascimento.split("/").reverse().join("-")
          : null,
        observacoes: data.observacoes?.trim() || null,
        fotoUrl: novaFotoUrl,
      };

      console.log("=== PAYLOAD ENVIADO ===");
      console.log("URL:", `/tenant/treinadores/${id}`);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const res = await api.put(`/tenant/treinadores/${id}`, payload);
      return res.data;
    },

    onSuccess: () => {
      toast.success("treinador atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["treinador", id] });
      queryClient.invalidateQueries({ queryKey: ["treinadores"] });

      setTimeout(() => {
        router.push("/treinador");
      }, 1500);
    },

    onError: (err: any) => {
     const serverMessage = err.response?.data?.error || err.message || "Erro desconhecido";

    console.error("❌ Erro ao atualizar treinador:", err.response?.data || err);

    // Tratamento inteligente por status
    if (err.response?.status === 404) {
      toast.error("treinador não encontrado");
    } else if (err.response?.status === 400) {
      toast.error("Dados inválidos", { description: serverMessage });
    } else {
      toast.error("Erro ao atualizar treinador", {
        description: serverMessage,
      });
    }
    },
  });

  // Mutation para redefinir senha
  const redefinirSenhaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tenant/treinadores/${id}/redefinir-senha`);
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

  const handleImageChange = (file: File | null, imageUrl?: string) => {
    setSelectedFile(file);
    if (imageUrl) setCurrentImageUrl(imageUrl);
    setIsRemovingImage(false);
  };

const handleRemoveImage = () => {
    setSelectedFile(null);
    setCurrentImageUrl(null);
    setIsRemovingImage(true);
  };

  const redefinirSenha = () => {
    if (confirm("Tem certeza que deseja gerar uma nova senha temporária?")) {
      redefinirSenhaMutation.mutate();
    }
  };

    const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <span className="ml-4 text-xl">Carregando dados do treinador...</span>
      </div>
    );
  }

  if (error || !treinador) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold">Treinador não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/treinador">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/treinador">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Treinador treinador</h1>
          <p className="text-gray-600">Atualize as informações de {treinador.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <UserPlus className="h-7 w-7 text-red-600" />
            Dados do Treinador
          </CardTitle>
        </CardHeader>

        <CardContent>
          {updateMutation.isPending && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center mb-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-red-800">Salvando alterações... Aguarde</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto */}
            <div suppressHydrationWarning={true} className="flex justify-center py-6 border-b">
            <ImageUploader
              currentImageUrl={currentImageUrl || undefined}
              entityName={watchedName || "treinador"}
              uploadEndpoint={`/tenant/upload/treinador/${id}`}
              deleteEndpoint={`/tenant/upload/treinador/${id}`}
              onUploadSuccess={(url) => {
                setCurrentImageUrl(url);
                setSelectedFile(null);
                setIsRemovingImage(false);
              }}
              onRemove={() => {
                setCurrentImageUrl(null);
                setSelectedFile(null);
                setIsRemovingImage(true);
              }}
              size="lg"
              className="mx-auto"
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
                <Label htmlFor="telefone">Telefone *</Label>
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
                      maxLength={10}
                      value={field.value || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Alergias, restrições, preferências de turma..."
                  rows={4}
                  {...register("observacoes")}
                />
              </div>
            </div>

            {/* Acesso do Treinador + Redefinir Senha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Acesso do Treinador</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <Label>E-mail (usuário)</Label>
                  <Input value={treinador.email || "Não criado"} disabled />
                </div>

                <div className="self-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={redefinirSenha}
                    disabled={redefinirSenhaMutation.isPending || !treinador.userId}
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
                Ao redefinir, uma nova senha temporária será gerada automaticamente e exibida abaixo. Envie ao responsável ou aluno.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !isValid}
                className="flex-1 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
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
                <Link href="/treinador">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default EditarTreinadorPage;