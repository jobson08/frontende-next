/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

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

// Schema Zod alinhado com o DTO do backend (email obrigatório e sem uppercase)
const novoEscolinhaSchema = z.object({
  nome: z.string().min(3, "Nome da escolinha é obrigatório"),
  endereco: z.string().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  tipoDocumento: z.enum(["cpf", "cnpj"]).optional(),
  documento: z.string().optional(),
  nomeResponsavel: z.string().min(3, "Nome do responsável obrigatório"),
  emailContato: z.string().email("E-mail de contato inválido"),
  telefone: z.string().optional(),

  planoSaaS: z.enum(["basico", "pro", "enterprise"], {
    message: "Selecione um plano válido",
  }),
  valorPlanoMensal: z.number().positive("Valor do plano deve ser positivo"),

  valorMensalidadeFutebol: z.number().positive("Mensalidade futebol obrigatória"),
  valorMensalidadeCrossfit: z.number().positive().optional(),
  valorAulaExtraPadrao: z.number().positive().optional(),
  diaVencimento: z.number().int().min(1).max(31, "Dia deve ser entre 1 e 31"),

  aulasExtrasAtivas: z.boolean().optional(),
  crossfitAtivo: z.boolean().optional(),

  adminEmail: z.string().email("E-mail do admin obrigatório"),
  adminName: z.string().min(3, "Nome do admin obrigatório"),
  adminPassword: z.string().min(6, "Senha do admin deve ter no mínimo 6 caracteres"),
});

type NovoEscolinhaFormData = z.infer<typeof novoEscolinhaSchema>;

const NovoTenantPage = () => {
  const [tipoDocumento, setTipoDocumento] = useState<"cpf" | "cnpj">("cpf");
  const [documentoFormatado, setDocumentoFormatado] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<NovoEscolinhaFormData>({
    resolver: zodResolver(novoEscolinhaSchema),
    defaultValues: {
      planoSaaS: "basico",
      valorPlanoMensal: 150,
      valorMensalidadeFutebol: 180,
      diaVencimento: 10,
      aulasExtrasAtivas: false,
      crossfitAtivo: false,
    },
  });

  const formatCPF = (value: string) => value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  const formatCNPJ = (value: string) => value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formatted = value;

    if (tipoDocumento === "cpf") {
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

  const onSubmit = async (data: NovoEscolinhaFormData) => {
    setIsSubmitting(true);

    try {
      // Normaliza emails para minúsculo antes de enviar (segurança extra)
      data.emailContato = data.emailContato.toLowerCase();
      data.adminEmail = data.adminEmail.toLowerCase();

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:4000/api/v1/superadmin/escolinhas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao criar escolinha");
      }

      toast.success("Escolinha criada com sucesso!", {
        description: `${data.nome} agora faz parte do FutElite!`,
      });

      router.push("/superadmin/tenants");
    } catch (error: any) {
      toast.error("Erro ao criar escolinha", {
        description: error.message || "Verifique os dados e tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Logo */}
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
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Escolinha *</Label>
              <Input id="nome" placeholder="Ex: Gol de Placa Academy" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Tipo Documento + Documento */}
            <div className="space-y-4">
              <Label>Tipo de Documento</Label>
              <RadioGroup 
                value={tipoDocumento} 
                onValueChange={(v) => {
                  setTipoDocumento(v as "cpf" | "cnpj");
                  setDocumentoFormatado("");
                  setValue("documento", "");
                  setValue("tipoDocumento", v as "cpf" | "cnpj");
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpf" id="cpf" />
                    <Label htmlFor="cpf">CPF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cnpj" id="cnpj" />
                    <Label htmlFor="cnpj">CNPJ</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="documento">{tipoDocumento.toUpperCase()}</Label>
                <Input
                  id="documento"
                  placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={documentoFormatado}
                  onChange={handleDocumentoChange}
                  maxLength={tipoDocumento === "cpf" ? 14 : 18}
                />
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="nomeResponsavel">Nome do Responsável Legal *</Label>
              <Input id="nomeResponsavel" placeholder="João Silva" {...register("nomeResponsavel")} />
              {errors.nomeResponsavel && <p className="text-sm text-red-600">{errors.nomeResponsavel.message}</p>}
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emailContato">E-mail de Contato *</Label>
                <Input 
                  id="emailContato" 
                  type="email" 
                  placeholder="contato@escolinha.com"
                  {...register("emailContato", {
                    // Transforma em minúsculo AO DIGITAR
                    onChange: (e) => {
                      e.target.value = e.target.value.toLowerCase();
                      setValue("emailContato", e.target.value);
                    },
                  })}
                />
                {errors.emailContato && <p className="text-sm text-red-600">{errors.emailContato.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(11) 99999-8888" {...register("telefone")} />
              </div>
            </div>

            {/* Endereço + Cidade + Estado */}
            <div className="space-y-6">
              {/* Endereço completo */}
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo *</Label>
                <Textarea 
                  id="endereco" 
                  placeholder="Rua das Flores, 123 - Centro" 
                  {...register("endereco")} 
                />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input id="cidade" {...register("cidade")} />
                  {errors.cidade && <p className="text-sm text-red-600">{errors.cidade.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
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
                          {/* ... todos os estados ... */}
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
                </div>
              </div>
            </div>

            {/* Plano SaaS */}
            <div className="space-y-2">
              <Label>Plano FutElite *</Label>
              <Controller
                name="planoSaaS"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico - R$ 150/mês</SelectItem>
                      <SelectItem value="pro">Pro - R$ 300/mês</SelectItem>
                      <SelectItem value="enterprise">Enterprise - R$ 500/mês</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.planoSaaS && <p className="text-sm text-red-600">{errors.planoSaaS.message}</p>}
            </div>

            {/* Valores dos alunos */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold">Valores dos Serviços (definidos pela escolinha)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="valorMensalidadeFutebol">Mensalidade Futebol (R$) *</Label>
                  <Input
                    id="valorMensalidadeFutebol"
                    type="number"
                    step="0.01"
                    placeholder="180.00"
                    {...register("valorMensalidadeFutebol", { valueAsNumber: true })}
                  />
                  {errors.valorMensalidadeFutebol && <p className="text-sm text-red-600">{errors.valorMensalidadeFutebol.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diaVencimento">Dia de Vencimento *</Label>
                  <Input
                    id="diaVencimento"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="10"
                    {...register("diaVencimento", { valueAsNumber: true })}
                  />
                  {errors.diaVencimento && <p className="text-sm text-red-600">{errors.diaVencimento.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorMensalidadeCrossfit">Mensalidade CrossFit (R$)</Label>
                  <Input
                    id="valorMensalidadeCrossfit"
                    type="number"
                    step="0.01"
                    placeholder="199.00"
                    {...register("valorMensalidadeCrossfit", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorAulaExtraPadrao">Valor Aula Extra Padrão (R$)</Label>
                  <Input
                    id="valorAulaExtraPadrao"
                    type="number"
                    step="0.01"
                    placeholder="80.00"
                    {...register("valorAulaExtraPadrao", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div className="space-y-4">
              <Label>Módulos Adicionais</Label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("aulasExtrasAtivas")} className="h-4 w-4 rounded" />
                  <span>Aulas Extras Personalizadas</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("crossfitAtivo")} className="h-4 w-4 rounded" />
                  <span>CrossFit para Adultos</span>
                </label>
              </div>
            </div>

            {/* Admin da escolinha */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-semibold">Administrador Inicial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nome *</Label>
                  <Input id="adminName" placeholder="João Admin" {...register("adminName")} />
                  {errors.adminName && <p className="text-sm text-red-600">{errors.adminName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">E-mail *</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    placeholder="admin@escolinha.com"
                    {...register("adminEmail", {
                      // Transforma em minúsculo AO DIGITAR
                      onChange: (e) => {
                        e.target.value = e.target.value.toLowerCase();
                        setValue("adminEmail", e.target.value);
                      },
                    })}
                  />
                  {errors.adminEmail && <p className="text-sm text-red-600">{errors.adminEmail.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adminPassword">Senha inicial *</Label>
                  <Input id="adminPassword" type="password" placeholder="••••••••" {...register("adminPassword")} />
                  {errors.adminPassword && <p className="text-sm text-red-600">{errors.adminPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-8">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
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