/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Trash2, Camera, User, AlertCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";
import InputTelefone from "@/src/components/common/InputTelefone";
import ImageUploader from "@/src/components/ImageUploader";
import InputTelefoneEdit from "@/src/components/common/inputsEdit/InputTelefoneEdit";
import InputCPFEdit from "@/src/components/common/inputsEdit/InputCPFEdit";

// Schema Zod para edição de funcionário
const editarFuncionarioSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  cargo: z.enum([
    "PROFESSOR",
    "RECEPCAO",
    "ADMINISTRATIVO",
    "TREINADOR",
    "GERENTE",
  ], { message: "Cargo inválido" }),
  salario: z.number().positive({ message: "Salário deve ser positivo" }).optional(),
  observacoes: z.string().optional(),
  fotoUrl: z.string().url({ message: "URL da foto inválida" }).optional(),
});

type FormData = z.infer<typeof editarFuncionarioSchema>;

// Interface do funcionário retornada pelo backend
interface FuncionarioDetalhe {
  id: string;
  nome: string;
  cargo: "PROFESSOR" | "RECEPCAO" | "ADMINISTRATIVO" | "TREINADOR" | "GERENTE";
  salario: number | null;
  telefone: string | null;
  cpf: string | null;
  email: string | null;
  observacoes: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  fotoUrl?: string | null;
}

const EditarFuncionarioPage = () => {
  const params = useParams();
  const funcionarioId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(editarFuncionarioSchema),
  });

  const watchedName = watch("nome");

  // Busca detalhes do funcionário
  const { data: funcionario, isLoading, error } = useQuery<FuncionarioDetalhe>({
    queryKey: ["funcionario", funcionarioId],
    queryFn: async () => {
      const res = await api.get(`/tenant/funcionarios/${funcionarioId}`);
      return res.data.data;
    },
    enabled: !!funcionarioId,
  });

  // Pré-preenche o form quando os dados chegam
  useEffect(() => {
    if (funcionario) {
      setCurrentImageUrl(funcionario.fotoUrl || null);
      setSelectedFile(null);
      setIsRemovingImage(false);

      setValue("nome", funcionario.nome  || "");
      setValue("email", funcionario.email || "");
      setValue("cpf", funcionario.cpf || "");
      setValue("telefone", funcionario.telefone || "");
      setValue("cargo",funcionario.cargo || "TREINADOR");
      setValue("salario", funcionario.salario || undefined);
      setValue("observacoes", funcionario.observacoes || "");
      

   /*   reset({
        nome: funcionario.nome || "",
        telefone: funcionario.telefone || "",
        cargo: funcionario.cargo || "TREINADOR",
        salario: funcionario.salario || undefined,
        observacoes: funcionario.observacoes || "",
        fotoUrl: funcionario.fotoUrl || "",
      });*/
    }
  }, [funcionario, reset]);

  // Mutation para atualizar funcionário
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
    let novaFotoUrl = funcionario?.fotoUrl || null;

     if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await api.post(`/tenant/upload/funcionario/${funcionarioId}`, formData);
        novaFotoUrl = res.data.url;
      }

      if (isRemovingImage && !selectedFile) {
        novaFotoUrl = null;
      }

      const payload = {
        nome: data.nome.trim(),
        telefone: data.telefone?.trim() || null,
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        email: data.email?.toLowerCase().trim(),
        cargo: data.cargo,
        salario: data.salario,
        observacoes: data.observacoes?.trim() || null,
        fotoUrl: data.fotoUrl?.trim() || null,
      };
      console.log("=== PAYLOAD ENVIADO ===");
      console.log("URL:", `/tenant/funcionario/${funcionarioId}`);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const url = `/tenant/funcionarios/${funcionarioId}`;
      const res = await api.put(url, payload);
      return res.data;
    },
    onSuccess: () => {
      console.log("=== [UPDATE FUNCIONÁRIO] Sucesso total! ===");
      toast.success("Funcionário atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["funcionario", funcionarioId] });
      setTimeout(() => {
        router.push("/funcionario");
      }, 1500);
    },
      onError: (err: any) => {
     const serverMessage = err.response?.data?.error || err.message || "Erro desconhecido";

    console.error("❌ Erro ao atualizar funcionario:", err.response?.data || err);

    // Tratamento inteligente por status
    if (err.response?.status === 404) {
      toast.error("funcionario não encontrado");
    } else if (err.response?.status === 400) {
      toast.error("Dados inválidos", { description: serverMessage });
    } else {
      toast.error("Erro ao atualizar funcionario", {
        description: serverMessage,
      });
    }
    },
  });

// Mutation para redefinir senha (geração automática no backend)
  const redefinirSenhaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tenant/funcionarios/${funcionarioId}/redefinir-senha`);
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
              Copie e envie ao funcionário imediatamente. Ele deve trocar no primeiro acesso.
            </p>
          </div>
        ),
        duration: 30000,
        action: {
          label: "Copiar senha",
          onClick: () => {
            navigator.clipboard.writeText(result.senhaTemporaria || "");
            toast("Senha copiada para a área de transferência!");
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <span className="ml-4 text-xl">Carregando dados...</span>
      </div>
    );
  }

  if (error || !funcionario) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-red-600">
        <AlertCircle className="h-16 w-16" />
        <h2 className="mt-4 text-2xl font-bold">Funcionário não encontrado</h2>
        <Button className="mt-6" asChild>
          <Link href="/funcionario">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
           <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/funcionario">
            <ChevronLeft className="h-5 w-5" />
           </Link>
         </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Funcionario</h1>
            <p className="text-gray-600">Atualize as informações de {funcionario.nome}</p>
          </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <User className="h-7 w-7 text-orange-600" />
            Editar Dados do Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto */}
            <div suppressHydrationWarning={true} className="flex justify-center py-6 border-b">
            <ImageUploader
              currentImageUrl={currentImageUrl || undefined}
              entityName={watchedName || "Funcionario"}
              uploadEndpoint={`/tenant/upload/funcionario/${funcionarioId}`}
              deleteEndpoint={`/tenant/upload/funcionario/${funcionarioId}`}
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

                {/* Cargo */}
	              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select
                  defaultValue={funcionario.cargo}
                  onValueChange={(value) => setValue("cargo", value as "PROFESSOR" | "RECEPCAO" | "ADMINISTRATIVO" | "TREINADOR")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                    <SelectItem value="RECEPCAO">Recepção</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="TREINADOR">Treinador</SelectItem>
                    <SelectItem value="GERENTE">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                {/* Salário */}
                <div className="space-y-2">
                  <Label htmlFor="salario">Salário (opcional)</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    placeholder="R$ 3.500,00"
                    {...register("salario", { valueAsNumber: true })}
                  />
                  {errors.salario && <p className="text-sm text-red-600">{errors.salario.message}</p>}
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
                      placeholder="(xx) xxxxx-xxxx"
                      value={field.value || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>

                  {/* Telefone */}
               <div className="space-y-2">
                 <Label htmlFor="cpf">CPF *</Label>
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
              
              {/* Email*/}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email">email*</Label>
                  <Input id="email" placeholder="exemplo@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
           </div>
         </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Horário de trabalho, especialidade, etc..."
                className="resize-none"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Acesso do Funcionário + Redefinir Senha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800">Acesso do Funcionário</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <Label>E-mail (usuário)</Label>
                  <Input value={funcionario.email || "Não criado"} disabled />
                </div>

                <div className="self-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={redefinirSenha}
                    disabled={redefinirSenhaMutation.isPending || !funcionario.userId}
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
                Ao redefinir, uma nova senha temporária será gerada automaticamente e exibida abaixo. Envie ao funcionário.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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
                <Link href="funcionario">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default EditarFuncionarioPage;