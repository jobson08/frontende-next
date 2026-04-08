/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit/novo/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Loader2, UserPlus, Mail, Phone, Calendar, Camera, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";
import InputCPF from "@/src/components/common/InputCPF";
import InputTelefone from "@/src/components/common/InputTelefone";
import InputData from "@/src/components/common/InputData";

// Função para gerar senha aleatória (igual ao responsável)
function gerarSenhaAleatoria(tamanho = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Schema Zod (alinhado com o DTO do backend)
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório para envio do login" }),
  cpf: z.string().optional(),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  dataNascimento: z.string().min(10, { message: "Data de nascimento obrigatória (dd/mm/aaaa)" }),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoAlunoCrossfitPage = () => {
  const router = useRouter();

 // const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
  });

  const watchedName = watch("nome");

  /*const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };*/

//Mution criação aluno crossfit com foto

 const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();

    //campo do aluno
    formData.append("nome", data.nome.trim());
    formData.append("dataNascimento", data.dataNascimento.split("/").reverse().join("-"));
    formData.append("telefone", data.telefone.trim());
    formData.append("cpf", data.cpf ? data.cpf.replace(/\D/g, "") : "");
    formData.append("email", data.email.trim().toLowerCase());
    formData.append("status", "ATIVO");
    formData.append("observacoes", data.observacoes?.trim() || "");
   // formData.append("password", senhaTemporaria)

     // === FOTO ===
    if (selectedFile) {
      formData.append("foto", selectedFile);
      console.log("✅ Foto adicionada ao FormData:", selectedFile.name, selectedFile.size);
    } else {
      console.log("⚠️ Nenhuma foto selecionada");
    }

    // Debug completo do FormData
    console.log("📋 Conteúdo do FormData enviado:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   ${key} → FILE: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`   ${key} → ${value}`);
      }
    }

    const response = await api.post("/tenant/alunos-crossfit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("📥 Resposta do backend:", response.data);
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

      setTimeout(() => router.push("/crossfit/aluno"), 1800);
    },

    onError: (err: any) => {
      console.error("❌ Erro ao criar aluno:", err.response?.data || err);
      toast.error("Erro ao cadastrar aluno", {
        description: err.response?.data?.error || err.message || "Tente novamente",
      });
  },
});

   const handleImageChange = (file: File | null, url?: string) => {
  setSelectedFile(file);
  if (url) setCurrentImageUrl(url);
  console.log("📸 Imagem selecionada:", file?.name);
};

  const handleRemoveImage = () => {
  setSelectedFile(null);
  setCurrentImageUrl(null);
  console.log("🗑️ Imagem removida");
};


  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };


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
          <h1 className="text-3xl font-bold">Novo Aluno CrossFit</h1>
          <p className="text-gray-600">Preencha os dados do novo aluno adulto</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-red-600" />
            Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ImageUploader */}
            {/* Foto - Versão Simples e Eficiente */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                  <AvatarImage src={currentImageUrl || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {watchedName ? watchedName.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => document.getElementById("foto-input")?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Adicionar foto
                </Button>

                {currentImageUrl && (
                  <Button type="button" variant="destructive" onClick={() => {
                    setSelectedFile(null);
                    setCurrentImageUrl(null);
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setCurrentImageUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="ex: Carlos Silva" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* E-mail (obrigatório para login) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="carlos@email.com"
                {...register("email", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                    setValue("email", e.target.value);
                  },
                })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">O login será criado automaticamente e enviado para este e-mail</p>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <InputCPF id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
              {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <InputTelefone id="telefone" placeholder="(11) 97777-6666" {...register("telefone")} />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento *</Label>
              <InputData 
                id="dataNascimento" 
                placeholder="dd/mm/aaaa" 
                maxLength={10} 
                {...register("dataNascimento")} 
              />
              {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="ex: Cliente tem experiência em CrossFit e prefere turmas avançadas"
                className="resize-none"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando aluno...
                  </>
                ) : (
                  "Criar Aluno CrossFit"
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/crossfit">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default NovoAlunoCrossfitPage;