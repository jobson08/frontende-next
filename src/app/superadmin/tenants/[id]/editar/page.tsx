"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";

// Schema Zod
const editEscolinhaSchema = z.object({
  nome: z.string().min(3, "Nome da escolinha deve ter pelo menos 3 caracteres"),
  tipoDocumento: z.enum(["CPF", "CNPJ"]).optional(),
  documento: z.string().min(1, "Documento é obrigatório").optional(),
  endereco: z.string().min(5, "Endereço completo obrigatório").optional(),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  emailContato: z.string().email("E-mail do responsável inválido").optional(),
  nomeResponsavel: z.string().min(3, "Nome do responsável obrigatório").optional(),
  planoSaaS: z.enum(["basico", "pro", "enterprise"]).optional(),
  observacoes: z.string().optional(),
});

type EditEscolinhaFormData = z.infer<typeof editEscolinhaSchema>;

const EditarEscolinhaPage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Funções de máscara movidas para dentro do componente
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  // Busca dados reais do backend
  const { data: response, isLoading: isLoadingTenant } = useQuery({
    queryKey: ["escolinha", id],
    queryFn: async () => {
      console.log("[Editar] Buscando escolinha com ID:", id);
      const res = await api.get(`http://localhost:4000/api/v1/superadmin/escolinhas/${id}`);
      console.log("[Editar] Dados recebidos:", res.data);
      return res.data; // { success: true, data: {...} }
    },
  });

  const tenant = response?.data; // objeto real da escolinha

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditEscolinhaFormData>({
    resolver: zodResolver(editEscolinhaSchema),
  });

  const tipoDocumento = watch("tipoDocumento") || "CPF";
  const documento = watch("documento") || "";

  // Pré-preenche com dados reais
  useEffect(() => {
    if (tenant) {
      const cleaned = tenant.documento?.replace(/\D/g, "") || "";

      reset({
        nome: tenant.nome || "",
        tipoDocumento: tenant.tipoDocumento || "CPF",
        documento: cleaned,
        endereco: tenant.endereco || "",
        telefone: tenant.telefone || "",
        emailContato: tenant.emailContato || "",
        nomeResponsavel: tenant.nomeResponsavel || "",
        planoSaaS: tenant.planoSaaS || "basico",
        observacoes: tenant.observacoes || "",
      });

      setLogoPreview(tenant.logoUrl || null);
    }
  }, [tenant, reset]);

 const updateMutation = useMutation({
  mutationFn: async (data: EditEscolinhaFormData) => {
    console.log("[Frontend] Enviando dados para PUT:", data); // ← log para debug
    await api.put(`http://localhost:4000/api/v1/superadmin/escolinhas/${id}`, data); // ← JSON direto
  },
  onSuccess: () => {
    toast.success("Escolinha atualizada com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["escolinha", id] });
    queryClient.invalidateQueries({ queryKey: ["escolinhas"] });
    router.push(`/superadmin/tenants/${id}`);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: (err: any) => {
    console.error("[Frontend] Erro completo ao salvar:", err);
    toast.error("Erro ao atualizar escolinha");
  },
});

  const validarDocumento = (tipo: "CPF" | "CNPJ" = "CPF", valor: string = ""): boolean => {
    const cleaned = valor.replace(/\D/g, "");
    if (tipo === "CPF") return cleaned.length === 11;
    if (tipo === "CNPJ") return cleaned.length === 14;
    return true; // se não tiver documento, aceita
  };

  const onSubmit = async (data: EditEscolinhaFormData) => {
    if (data.documento && !validarDocumento(data.tipoDocumento, data.documento)) {
      toast.error("Documento inválido", {
        description: data.tipoDocumento === "CPF" ? "CPF deve ter 11 dígitos" : "CNPJ deve ter 14 dígitos",
      });
      return;
    }

    updateMutation.mutate(data);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg font-medium">Carregando dados da escolinha...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Escolinha não encontrada</h1>
        <Button asChild className="mt-4">
          <Link href="/superadmin/tenants">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/superadmin/tenants/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Escolinha</h1>
          <p className="text-gray-600">Atualize as informações de {tenant.nome}</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6 text-green-600" />
            Editar Dados da Escolinha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Logo da Escolinha */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-green-100">
                <AvatarImage src={logoPreview || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-3xl font-bold">
                  {tenant.nome?.split(" ").map((n: string) => n[0]).join("") || ""}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Alterar logo
                </Button>
                {logoPreview && (
                  <Button type="button" variant="destructive" size="sm" onClick={removeLogo}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 text-center">Logo opcional (JPG, PNG, recomendado quadrado)</p>
            </div>

            {/* Nome da Escolinha */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Escolinha *</Label>
              <Input id="nome" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Tipo de Documento + CPF/CNPJ */}
            <div className="space-y-4">
              <Label>Tipo de Documento</Label>
              <RadioGroup 
                value={tipoDocumento} 
                onValueChange={(v) => {
                  setValue("tipoDocumento", v as "CPF" | "CNPJ");
                  setValue("documento", "");
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CPF" id="cpf" />
                    <Label htmlFor="cpf">CPF (Pessoa Física)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CNPJ" id="cnpj" />
                    <Label htmlFor="cnpj">CNPJ (Pessoa Jurídica)</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="documento">{tipoDocumento}</Label>
                <Input
                  id="documento"
                  placeholder={tipoDocumento === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={tipoDocumento === "CPF" ? formatCPF(documento) : formatCNPJ(documento)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setValue("documento", value);
                  }}
                  maxLength={tipoDocumento === "CPF" ? 14 : 18}
                />
                {errors.documento && <p className="text-sm text-red-600">{errors.documento.message}</p>}
              </div>
            </div>

            {/* Endereço e Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo</Label>
                <Input id="endereco" {...register("endereco")} />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Responsável da Escolinha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeResponsavel">Nome do responsável</Label>
                  <Input id="nomeResponsavel" {...register("nomeResponsavel")} />
                  {errors.nomeResponsavel && <p className="text-sm text-red-600">{errors.nomeResponsavel.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContato">E-mail do responsável</Label>
                  <Input id="emailContato" type="email" {...register("emailContato")} />
                  {errors.emailContato && <p className="text-sm text-red-600">{errors.emailContato.message}</p>}
                </div>
              </div>
            </div>

            {/* Plano */}
            <div className="space-y-2">
              <Label>Plano SaaS</Label>
              <Controller
                name="planoSaaS"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.planoSaaS && <p className="text-sm text-red-600">{errors.planoSaaS.message}</p>}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                className="resize-none"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/superadmin/tenants/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarEscolinhaPage;