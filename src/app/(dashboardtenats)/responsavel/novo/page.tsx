/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/responsavel/novo/page.tsx
"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Camera, ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";
import InputCPF from "@/src/components/common/InputCPF";
import InputTelefone from "@/src/components/common/InputTelefone";


// Função para gerar senha aleatória
function gerarSenhaAleatoria(tamanho = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Schema Zod
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório para envio do login" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoResponsavelPage = () => {
  const router = useRouter(); // ← adicionado para redirecionar
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedName = watch("nome");

 const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();

      formData.append("nome", data.nome.trim());
      formData.append("telefone", data.telefone.trim());
      formData.append("cpf", data.cpf ? data.cpf.replace(/\D/g, "") : "");
      formData.append("email", data.email.trim().toLowerCase());
      formData.append("observacoes", data.observacoes?.trim() || "");

      // Adiciona a foto se existir
      if (selectedFile) {
        formData.append("foto", selectedFile);
        console.log("📸 Foto incluída no FormData:", selectedFile.name);
      }

      console.log("📤 Enviando FormData completo...");

      const response = await api.post(
    "/tenant/responsaveis",
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
      toast.success("Responsavel  criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p>Responsavel  adicionado à escolinha.</p>
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
        router.push("/responsavel");
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
        toast.error("Falha ao cadastrar responsvel", { description: serverError });
      }
    },
  });

   const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };


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
          <h1 className="text-3xl font-bold">Novo Responsável</h1>
          <p className="text-gray-600">Preencha os dados do responsável</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dados do Responsável</CardTitle>
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

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="Maria Oliveira Santos" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* E-mail (obrigatório para login) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="maria@email.com"
                {...register("email", {
                  // Transforma em minúsculo AO DIGITAR (UX imediata)
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                    setValue("email", e.target.value);
                  },
                })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">O login será criado automaticamente e enviado para este e-mail</p>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <InputTelefone id="telefone" placeholder="(11) 97777-6666" {...register("telefone")} />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <InputCPF id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Informações adicionais sobre o responsável..."
                className="resize-none"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
             <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando responsável...
                  </>
                ) : (
                  "Criar Responsável"
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

export default NovoResponsavelPage;