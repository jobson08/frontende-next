// src/app/superadmin/tenants/novo/page.tsx
"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, Building2, Camera, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

// Máscaras
const formatCPF = (value: string) => value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const formatCNPJ = (value: string) => value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

// Schema Zod
const novoTenantSchema = z.object({
  name: z.string().min(3, "Nome da escolinha é obrigatório"),
  tipoDocumento: z.enum(["CPF", "CNPJ"], { message: "Selecione CPF ou CNPJ" }),
  documento: z.string().min(1, "Documento é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.enum(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]),
  endereco: z.string().min(5, "Endereço é obrigatório"),
  telefone: z.string().min(10, "Telefone inválido"),
  emailAdmin: z.string().email("E-mail inválido"),
  nomeAdmin: z.string().min(3, "Nome do administrador é obrigatório"),
  plano: z.enum(["Básico", "Pro", "Enterprise"]),
  observacoes: z.string().optional(),
});

type NovoTenantFormData = z.infer<typeof novoTenantSchema>;

const NovoTenantPage = () => {
  const [tipoDocumento, setTipoDocumento] = useState<"CPF" | "CNPJ">("CPF");
  const [documentoFormatado, setDocumentoFormatado] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NovoTenantFormData>({
    resolver: zodResolver(novoTenantSchema),
  });

  const validarDocumento = (tipo: "CPF" | "CNPJ", valor: string): boolean => {
    const cleaned = valor.replace(/\D/g, "");
    if (tipo === "CPF") return cleaned.length === 11;
    if (tipo === "CNPJ") return cleaned.length === 14;
    return false;
  };

  const onSubmit = async (data: NovoTenantFormData) => {
    if (!validarDocumento(data.tipoDocumento, data.documento)) {
      toast.error("Documento inválido", {
        description: data.tipoDocumento === "CPF" ? "CPF deve ter 11 dígitos" : "CNPJ deve ter 14 dígitos",
      });
      return;
    }

    try {
      console.log("Nova escolinha criada:", {
        ...data,
        logo: logoPreview ? "Logo enviada (preview disponível)" : "Sem logo",
      });
      await new Promise(r => setTimeout(r, 1500));

      toast.success("Escolinha criada com sucesso!", {
        description: `${data.name} foi adicionada à plataforma FutElite.`,
      });
    } catch {
      toast.error("Erro ao criar escolinha");
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formatted = value;

    if (tipoDocumento === "CPF") {
      formatted = formatCPF(value);
    } else {
      formatted = formatCNPJ(value);
    }

    setDocumentoFormatado(formatted);
    setValue("documento", value);
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
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/superadmin/tenants">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Escolinha de Futebol</h1>
          <p className="text-gray-600">Adicione uma nova unidade à plataforma FutElite</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-green-600" />
            Dados da Escolinha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Logo da Escolinha */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-green-100">
                <AvatarImage src={logoPreview || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-3xl font-bold">
                  ?
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Escolher logo
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
              <Input id="name" placeholder="Ex: Gol de Placa Academy" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Tipo de Documento + CPF/CNPJ */}
            <div className="space-y-4">
              <Label>Tipo de Documento *</Label>
              <RadioGroup 
                value={tipoDocumento} 
                onValueChange={(v) => {
                  setTipoDocumento(v as "CPF" | "CNPJ");
                  setDocumentoFormatado("");
                  setValue("documento", "");
                  setValue("tipoDocumento", v as "CPF" | "CNPJ");
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
                  value={documentoFormatado}
                  onChange={handleDocumentoChange}
                  maxLength={tipoDocumento === "CPF" ? 14 : 18}
                />
                {errors.documento && <p className="text-sm text-red-600">{errors.documento.message}</p>}
              </div>
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input id="cidade" placeholder="São Paulo" {...register("cidade")} />
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
                <Input id="endereco" placeholder="Rua das Flores, 123 - Centro" {...register("endereco")} />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone da escolinha *</Label>
                <Input id="telefone" placeholder="(11) 99999-8888" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>
            </div>

            {/* Administrador */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Administrador da Escolinha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeAdmin">Nome do administrador *</Label>
                  <Input id="nomeAdmin" placeholder="João Silva" {...register("nomeAdmin")} />
                  {errors.nomeAdmin && <p className="text-sm text-red-600">{errors.nomeAdmin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAdmin">E-mail do administrador *</Label>
                  <Input id="emailAdmin" type="email" placeholder="admin@escolinha.com" {...register("emailAdmin")} />
                  {errors.emailAdmin && <p className="text-sm text-red-600">{errors.emailAdmin.message}</p>}
                </div>
              </div>
            </div>

            {/* Plano */}
            <div className="space-y-2">
              <Label>Plano da Escolinha *</Label>
              <Controller
                name="plano"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico - R$ 299/mês</SelectItem>
                      <SelectItem value="Pro">Pro - R$ 599/mês</SelectItem>
                      <SelectItem value="Enterprise">Enterprise - R$ 999/mês</SelectItem>
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
                placeholder="Ex: Escolinha focada em categorias sub-11..."
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
                    Criando escolinha...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Escolinha
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

export default NovoTenantPage;