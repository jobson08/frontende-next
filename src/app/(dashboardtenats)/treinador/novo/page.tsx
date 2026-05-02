/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinadores/novo/page.tsx
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
import InputTelefone from "@/src/components/common/InputTelefone";

// Schema Zod
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  dataNascimento: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoTreinadorPage = () => {
  const router = useRouter();
 

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,           // ← Adicionado aqui
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedName = watch("nome");

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
     const payload = {
        ...data,
        email: data.email.toLowerCase().trim(),
        
      };
      

      const response = await api.post("/tenant/treinadores", payload);
      return response.data;
    },

    onSuccess: (result) => {
      toast.success("Treinador criado com sucesso!", {
        description: (
          <div className="space-y-3 text-sm">
            <p>Treinador adicionado à escolinha.</p>
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
              toast.success("Senha copiada!");
            }
          },
        },
      });

      setTimeout(() => {
        router.push("/treinador");
      }, 2000);
    },

    onError: (err: any) => {
      console.error("❌ Erro ao criar treinador:", err.response?.data || err);
      toast.error(err.response?.data?.error || "Erro ao criar treinador");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setCurrentImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setCurrentImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/treinador">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Treinador</h1>
          <p className="text-gray-600">Preencha os dados do treinador</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dados do Treinador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload de Foto */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                  <AvatarImage src={currentImageUrl || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {watchedName ? watchedName.split(" ").map((n) => n[0]).join("").toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Adicionar foto
                </Button>

                {currentImageUrl && (
                  <Button type="button" variant="destructive" onClick={handleRemoveImage}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="Carlos Oliveira Santos" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* E-mail */}
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
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <InputTelefone id="telefone" placeholder="(11) 98765-4321" {...register("telefone")} />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
              <Input type="date" id="dataNascimento" {...register("dataNascimento")} />
              {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Experiência, especialidades..."
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando treinador...
                  </>
                ) : (
                  "Criar Treinador"
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

export default NovoTreinadorPage;