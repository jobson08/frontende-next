// src/app/superadmin/tenants/[id]/editar/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

// Máscaras
const formatCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

// Schema Zod
const editTenantSchema = z.object({
  name: z.string().min(3, "Nome da escolinha deve ter pelo menos 3 caracteres"),
  tipoDocumento: z.enum(["CPF", "CNPJ"]),
  documento: z.string().min(1, "Documento é obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.enum(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]),
  endereco: z.string().min(5, "Endereço completo obrigatório"),
  telefone: z.string().min(10, "Telefone inválido"),
  emailAdmin: z.string().email("E-mail do admin inválido"),
  nomeAdmin: z.string().min(3, "Nome do administrador obrigatório"),
  plano: z.enum(["Básico", "Pro", "Enterprise"]),
  observacoes: z.string().optional(),
});

type EditTenantFormData = z.infer<typeof editTenantSchema>;

// Mock
const tenantsMock = [
  {
    id: "1",
    name: "Escolinha Gol de Placa",
    tipoDocumento: "CNPJ" as const,
    documento: "12345678000199",
    cidade: "São Paulo",
    estado: "SP" as const,
    endereco: "Rua das Flores, 123",
    telefone: "(11) 99999-8888",
    emailAdmin: "admin@goldeplaca.com",
    nomeAdmin: "João Silva",
    plano: "Pro" as const,
    observacoes: "Foco em sub-11 e sub-13.",
    logoUrl: "https://example.com/logo-goldeplaca.png",
  },
];

const EditarTenantPage = () => {
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTenantFormData>({
    resolver: zodResolver(editTenantSchema),
  });

  const tenant = tenantsMock.find(t => t.id === id);

  // Assista os valores do form (sem state local!)
  const tipoDocumento = watch("tipoDocumento") || "CPF";
  const documento = watch("documento") || "";

  // Pré-preenche com reset (sem setState local)
  useEffect(() => {
    if (tenant) {
      const cleaned = tenant.documento.replace(/\D/g, "");

      reset({
        name: tenant.name,
        tipoDocumento: tenant.tipoDocumento,
        documento: cleaned,
        cidade: tenant.cidade,
        estado: tenant.estado,
        endereco: tenant.endereco,
        telefone: tenant.telefone,
        emailAdmin: tenant.emailAdmin,
        nomeAdmin: tenant.nomeAdmin,
        plano: tenant.plano,
        observacoes: tenant.observacoes,
      });

      setLogoPreview(tenant.logoUrl || null);
    }
  }, [tenant, reset]);

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Escolinha não encontrada</h1>
        <Button asChild className="mt-4">
          <Link href="/superadmin/tenants">Voltar</Link>
        </Button>
      </div>
    );
  }

  const validarDocumento = (tipo: "CPF" | "CNPJ", valor: string): boolean => {
    const cleaned = valor.replace(/\D/g, "");
    if (tipo === "CPF") return cleaned.length === 11;
    if (tipo === "CNPJ") return cleaned.length === 14;
    return false;
  };

  const onSubmit = async (data: EditTenantFormData) => {
    if (!validarDocumento(data.tipoDocumento, data.documento)) {
      toast.error("Documento inválido", {
        description: data.tipoDocumento === "CPF" ? "CPF deve ter 11 dígitos" : "CNPJ deve ter 14 dígitos",
      });
      return;
    }

    try {
      console.log("Tenant atualizado:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Escolinha atualizada com sucesso!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/superadmin/tenants">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Escolinha</h1>
          <p className="text-gray-600">Atualize as informações de {tenant.name}</p>
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
                <AvatarFallback className="bg-linear-to-br from-green-600 to-emerald-600 text-white text-3xl font-bold">
                  {tenant.name.split(" ").map(n => n[0]).join("")}
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
              <Label htmlFor="name">Nome da Escolinha *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Tipo de Documento + CPF/CNPJ */}
            <div className="space-y-4">
              <Label>Tipo de Documento *</Label>
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
                <Label htmlFor="documento">{tipoDocumento} *</Label>
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

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input {...register("cidade")} />
                {errors.cidade && <p className="text-sm text-red-600">{errors.cidade.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-auto">
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
              </div>
            </div>

            {/* Endereço e Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo *</Label>
                <Input id="endereco" {...register("endereco")} />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>
            </div>

            {/* Administrador */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Administrador da Escolinha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeAdmin">Nome do administrador *</Label>
                  <Input id="nomeAdmin" {...register("nomeAdmin")} />
                  {errors.nomeAdmin && <p className="text-sm text-red-600">{errors.nomeAdmin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAdmin">E-mail do administrador *</Label>
                  <Input id="emailAdmin" type="email" {...register("emailAdmin")} />
                  {errors.emailAdmin && <p className="text-sm text-red-600">{errors.emailAdmin.message}</p>}
                </div>
              </div>
            </div>

            {/* Plano */}
            <div className="space-y-2">
              <Label>Plano *</Label>
              <Controller
                name="plano"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.plano && <p className="text-sm text-red-600">{errors.plano.message}</p>}
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
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
                <Link href="/superadmin/tenants">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarTenantPage;