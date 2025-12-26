// src/app/superadmin/configuracoes/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { Loader2, Camera, Trash2, Palette, Building2, DollarSign, Percent, CalendarDays, Send, Mail, Bell, AlertTriangle, Users, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";


// Schema para Perfil do Superadmin ABA 1
const perfilSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});

// Schema para Identidade Visual    ABA 1
const identidadeSchema = z.object({
  nomePlataforma: z.string().min(3, "Nome da plataforma obrigatório"),
});

// Schema para Planos e Preços ABA 2
const planosSchema = z.object({
  basicoAtivo: z.boolean(),
  basicoPreco: z.string().min(1, "Preço obrigatório"),
  basicoAlunos: z.string().min(1, "Limite obrigatório"),
  basicoTesteDias: z.string().optional(),

  proAtivo: z.boolean(),
  proPreco: z.string().min(1, "Preço obrigatório"),
  proAlunos: z.string().min(1, "Limite obrigatório"),
  proTesteDias: z.string().optional(),

  enterpriseAtivo: z.boolean(),
  enterprisePreco: z.string().min(1, "Preço obrigatório"),
  enterpriseAlunos: z.string().min(1, "Limite obrigatório"),
  enterpriseTesteDias: z.string().optional(),
});

// Schema para Pagamentos e Financeiro ABA 3
const financeiroSchema = z.object({
  chavePix: z.string().min(1, "Chave PIX obrigatória"),
  taxaAdministrativa: z.string().min(1, "Taxa obrigatória"),
  diasTolerancia: z.string().min(1, "Dias de tolerância obrigatórios"),
});

// Schema para Notificações e Templates ABA 4
const notificacoesSchema = z.object({
  emailSuporte: z.string().email("E-mail de suporte inválido"),
  ativarNotificacoesAutomaticas: z.boolean(),
  templateBemVindo: z.string().optional(),
  templatePagamentoAtrasado: z.string().optional(),
  templateNovoAluno: z.string().optional(),
});

// Schema para Regras da Plataforma ABA 5 
const regrasSchema = z.object({
  idadeMinima: z.string().min(1, "Idade mínima obrigatória"),
  idadeMaxima: z.string().min(1, "Idade máxima obrigatória"),
  categoriasPadrao: z.string().optional(),
  diasAtrasoSuspensao: z.string().min(1, "Dias para suspensão obrigatórios"),
  ativarSuspensaoAutomatica: z.boolean(),
});

type PerfilFormData = z.infer<typeof perfilSchema>; //ABA1
type IdentidadeFormData = z.infer<typeof identidadeSchema>; //ABA 1
type PlanosFormData = z.infer<typeof planosSchema>; //ABA 2
type FinanceiroFormData = z.infer<typeof financeiroSchema>; //ABA 3
type NotificacoesFormData = z.infer<typeof notificacoesSchema>;//ABA 4
type RegrasFormData = z.infer<typeof regrasSchema>; //ABA 5

const ConfiguracoesPage = () => {       //Inicio da função
    //(Etapa 1)
  // Perfil do Superadmin 
  const [fotoPreview, setFotoPreview] = useState<string | null>("https://example.com/superadmin-foto.jpg");
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Identidade Visual
  const [logoPreview, setLogoPreview] = useState<string | null>("https://example.com/futelite-logo.png");
  const logoInputRef = useRef<HTMLInputElement>(null);

// Form Perfil
  const {
    register: registerPerfil,
    handleSubmit: handleSubmitPerfil,
    formState: { isSubmitting: isSubmittingPerfil },
  } = useForm({
    defaultValues: {
      nome: "Super Admin",
      email: "superadmin@futelite.com",
      telefone: "(11) 99999-8888",
    },
  });

// Form Identidade
  const {
    register: registerIdentidade,
    handleSubmit: handleSubmitIdentidade,
    formState: { isSubmitting: isSubmittingIdentidade },
  } = useForm({
    defaultValues: {
      nomePlataforma: "FutElite",
    },
  });


//(Etapa 2)
    // Form Planos
  const {
    register: registerPlanos,
    handleSubmit: handleSubmitPlanos,
    formState: { isSubmitting: isSubmittingPlanos },
  } = useForm<PlanosFormData>({
    resolver: zodResolver(planosSchema),
    defaultValues: {
      basicoAtivo: true,
      basicoPreco: "299",
      basicoAlunos: "100",
      basicoTesteDias: "14",

      proAtivo: true,
      proPreco: "599",
      proAlunos: "500",
      proTesteDias: "30",

      enterpriseAtivo: true,
      enterprisePreco: "999",
      enterpriseAlunos: "Ilimitado",
      enterpriseTesteDias: "30",
    },
  });

  //(Etapa 3)
// Form Financeiro (Etapa 3)
  const {
    register: registerFinanceiro,
    handleSubmit: handleSubmitFinanceiro,
    formState: { isSubmitting: isSubmittingFinanceiro },
  } = useForm<FinanceiroFormData>({
    resolver: zodResolver(financeiroSchema),
    defaultValues: {
      chavePix: "superadmin@futelite.com",
      taxaAdministrativa: "10",
      diasTolerancia: "15",
    },
  });

  // Handlers Perfil
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFotoPreview(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  };

  const onSubmitPerfil = async (data: PerfilFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Perfil atualizado:", data);
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  };
//(Etapa 1)
  // Handlers Identidade
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
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const onSubmitIdentidade = async (data: IdentidadeFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Identidade atualizada:", data);
      toast.success("Identidade visual atualizada com sucesso!");
    } catch {
      toast.error("Erro ao salvar identidade");
    }
  };
//(Etapa 2)
  // Handler Planos
  const onSubmitPlanos = async (data: PlanosFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Planos atualizados:", data);
      toast.success("Planos e preços atualizados com sucesso!");
    } catch {
      toast.error("Erro ao salvar planos");
    }
  };
//(Etapa 3)
  // Handler Financeiro
  const onSubmitFinanceiro = async (data: FinanceiroFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Configurações financeiras atualizadas:", data);
      toast.success("Configurações financeiras atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações financeiras");
    }
  };

  // Form Notificações (Etapa 4)
  const {
    register: registerNotificacoes,
    handleSubmit: handleSubmitNotificacoes,
    formState: { isSubmitting: isSubmittingNotificacoes },
  } = useForm<NotificacoesFormData>({
    resolver: zodResolver(notificacoesSchema),
    defaultValues: {
      emailSuporte: "suporte@futelite.com",
      ativarNotificacoesAutomaticas: true,
      templateBemVindo: "Bem-vindo à {nome_escolinha}! Sua conta foi criada com sucesso. Acesse em {link_login}.",
      templatePagamentoAtrasado: "Pagamento atrasado na {nome_escolinha}. Regularize até {data_vencimento} para evitar suspensão.",
      templateNovoAluno: "Novo aluno cadastrado: {nome_aluno} na {nome_escolinha}.",
    },
  });

  // Form Regras (Etapa 5)
  const {
    register: registerRegras,
    handleSubmit: handleSubmitRegras,
    formState: { isSubmitting: isSubmittingRegras },
  } = useForm<RegrasFormData>({
    resolver: zodResolver(regrasSchema),
    defaultValues: {
      idadeMinima: "5",
      idadeMaxima: "17",
      categoriasPadrao: "Sub-7, Sub-9, Sub-11, Sub-13, Sub-15, Sub-17",
      diasAtrasoSuspensao: "30",
      ativarSuspensaoAutomatica: true,
    },
  });

   // Form Regras (Etapa 4)
  const onSubmitNotificacoes = async (data: NotificacoesFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Notificações e templates atualizados:", data);
      toast.success("Notificações e templates atualizados com sucesso!");
    } catch {
      toast.error("Erro ao salvar notificações");
    }
  };

   // Form Regras (Etapa 5)
  const onSubmitRegras = async (data: RegrasFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Regras da plataforma atualizadas:", data);
      toast.success("Regras da plataforma atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao salvar regras");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações da Plataforma</h1>
        <p className="text-gray-600 text-lg mt-2">Gerencie o perfil, identidade visual e planos da FutElite</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="perfil">Perfil do Superadmin</TabsTrigger>
            <TabsTrigger value="identidade">Identidade Visual</TabsTrigger>
            <TabsTrigger value="planos">Planos e Preços</TabsTrigger>
            <TabsTrigger value="financeiro">Pagamentos e Financeiro</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="regras">Regras</TabsTrigger>
        </TabsList>

        {/* ABA 1: Perfil do Superadmin */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPerfil(onSubmitPerfil)} className="space-y-8">
                {/* Foto do Superadmin */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                    <AvatarImage src={fotoPreview || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-cyan-600 text-white text-3xl font-bold">
                      SA
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fotoInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      Alterar foto
                    </Button>
                    {fotoPreview && (
                      <Button type="button" variant="destructive" size="sm" onClick={removeFoto}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fotoInputRef}
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </div>

                {/* Dados pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" {...registerPerfil("nome")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" disabled {...registerPerfil("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(11) 99999-8888" {...registerPerfil("telefone")} />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingPerfil} className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  {isSubmittingPerfil ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Perfil"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: Identidade Visual da Plataforma */}
        <TabsContent value="identidade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-6 w-6 text-purple-600" />
                Identidade Visual da FutElite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitIdentidade(onSubmitIdentidade)} className="space-y-8">
                {/* Logo da Plataforma */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-40 w-40 ring-4 ring-purple-100">
                    <AvatarImage src={logoPreview || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-4xl font-bold">
                      FE
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
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
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 text-center">Logo da plataforma (recomendado 400x400px, PNG transparente)</p>
                </div>

                {/* Nome da Plataforma */}
                <div className="space-y-2">
                  <Label htmlFor="nomePlataforma">Nome da Plataforma *</Label>
                  <Input id="nomePlataforma" placeholder="FutElite" {...registerIdentidade("nomePlataforma")} />
                </div>

                <Button type="submit" disabled={isSubmittingIdentidade} className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  {isSubmittingIdentidade ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Identidade Visual"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: Planos e Preços (NOVA ETAPA) */}
        <TabsContent value="planos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Planos e Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPlanos(onSubmitPlanos)} className="space-y-8">
                {/* Plano Básico */}
                <div className="space-y-6 p-6 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Badge className="bg-linear-to-r from-green-600 to-emerald-600">Básico</Badge>
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="basicoAtivo">Ativo</Label>
                      <Switch id="basicoAtivo" {...registerPlanos("basicoAtivo")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Preço mensal (R$)</Label>
                      <Input type="number" {...registerPlanos("basicoPreco")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de alunos</Label>
                      <Input placeholder="Ex: 100" {...registerPlanos("basicoAlunos")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teste grátis (dias)</Label>
                      <Input type="number" placeholder="0 para nenhum" {...registerPlanos("basicoTesteDias")} />
                    </div>
                  </div>
                </div>

                {/* Plano Pro */}
                <div className="space-y-6 p-6 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Badge className="bg-linear-to-r from-blue-600 to-cyan-600">Pro</Badge>
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="proAtivo">Ativo</Label>
                      <Switch id="proAtivo" {...registerPlanos("proAtivo")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Preço mensal (R$)</Label>
                      <Input type="number" {...registerPlanos("proPreco")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de alunos</Label>
                      <Input placeholder="Ex: 500" {...registerPlanos("proAlunos")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teste grátis (dias)</Label>
                      <Input type="number" placeholder="0 para nenhum" {...registerPlanos("proTesteDias")} />
                    </div>
                  </div>
                </div>

                {/* Plano Enterprise */}
                <div className="space-y-6 p-6 border rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Badge className="bg-linear-to-r from-purple-600 to-pink-600">Enterprise</Badge>
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="enterpriseAtivo">Ativo</Label>
                      <Switch id="enterpriseAtivo" {...registerPlanos("enterpriseAtivo")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Preço mensal (R$)</Label>
                      <Input type="number" {...registerPlanos("enterprisePreco")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de alunos</Label>
                      <Input placeholder="Ilimitado" {...registerPlanos("enterpriseAlunos")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teste grátis (dias)</Label>
                      <Input type="number" placeholder="0 para nenhum" {...registerPlanos("enterpriseTesteDias")} />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingPlanos} size="lg" className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {isSubmittingPlanos ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando planos...
                    </>
                  ) : (
                    "Salvar Planos e Preços"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: Pagamentos e Financeiro ( ETAPA 3) */}
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Pagamentos e Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFinanceiro(onSubmitFinanceiro)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="chavePix" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Chave PIX da Plataforma *
                    </Label>
                    <Input id="chavePix" placeholder="ex: superadmin@futelite.com" {...registerFinanceiro("chavePix")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxaAdministrativa" className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Taxa Administrativa da FutElite (%) *
                    </Label>
                    <Input id="taxaAdministrativa" type="number" min="0" max="100" placeholder="ex: 10" {...registerFinanceiro("taxaAdministrativa")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasTolerancia" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Dias de Tolerância para Atraso *
                    </Label>
                    <Input id="diasTolerancia" type="number" min="0" placeholder="ex: 15" {...registerFinanceiro("diasTolerancia")} />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingFinanceiro} size="lg" className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {isSubmittingFinanceiro ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando configurações financeiras...
                    </>
                  ) : (
                    "Salvar Configurações Financeiras"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: Notificações e Templates de E-mail (NOVA ETAPA 4) */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-orange-600" />
                Notificações e Templates de E-mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNotificacoes(onSubmitNotificacoes)} className="space-y-8">
                {/* E-mail de Suporte e Ativar Notificações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emailSuporte" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail de Suporte/Remetente *
                    </Label>
                    <Input id="emailSuporte" type="email" placeholder="suporte@futelite.com" {...registerNotificacoes("emailSuporte")} />
                  </div>

                  <div className="flex items-center gap-4 space-y-0 pt-8">
                    <Label htmlFor="ativarNotificacoesAutomaticas" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Ativar notificações automáticas
                    </Label>
                    <Switch id="ativarNotificacoesAutomaticas" {...registerNotificacoes("ativarNotificacoesAutomaticas")} />
                  </div>
                </div>

                {/* Templates de E-mail */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="templateBemVindo">Template: Bem-vindo à escolinha</Label>
                    <Textarea
                      id="templateBemVindo"
                      placeholder="Use {nome_escolinha}, {link_login}, {nome_admin}"
                      rows={4}
                      {...registerNotificacoes("templateBemVindo")}
                    />
                    <p className="text-xs text-gray-500">Variáveis: {`{nome_escolinha}, {nome_admin}, {link_login}`}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templatePagamentoAtrasado">Template: Pagamento atrasado</Label>
                    <Textarea
                      id="templatePagamentoAtrasado"
                      placeholder="Use {nome_escolinha}, {data_vencimento}, {valor}"
                      rows={4}
                      {...registerNotificacoes("templatePagamentoAtrasado")}
                    />
                    <p className="text-xs text-gray-500">Variáveis: {`{nome_escolinha}, {data_vencimento}, {valor}`}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateNovoAluno">Template: Novo aluno cadastrado</Label>
                    <Textarea
                      id="templateNovoAluno"
                      placeholder="Use {nome_aluno}, {nome_escolinha}"
                      rows={4}
                      {...registerNotificacoes("templateNovoAluno")}
                    />
                    <p className="text-xs text-gray-500">Variáveis: {`{nome_aluno}, {nome_escolinha}`}</p>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingNotificacoes} size="lg" className="w-full bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  {isSubmittingNotificacoes ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando notificações...
                    </>
                  ) : (
                    "Salvar Notificações e Templates"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ABA 6: Regras da Plataforma (NOVA ETAPA 5) */}
        <TabsContent value="regras">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                Regras da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRegras(onSubmitRegras)} className="space-y-8">
                {/* Idade mínima e máxima */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idadeMinima" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Idade Mínima para Alunos (anos) *
                    </Label>
                    <Input id="idadeMinima" type="number" min="0" placeholder="ex: 5" {...registerRegras("idadeMinima")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idadeMaxima" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Idade Máxima para Alunos (anos) *
                    </Label>
                    <Input id="idadeMaxima" type="number" min="0" placeholder="ex: 17" {...registerRegras("idadeMaxima")} />
                  </div>
                </div>

                {/* Categorias padrão */}
                <div className="space-y-2">
                  <Label htmlFor="categoriasPadrao" className="flex items-center gap-2">
                    <Badge className="bg-indigo-600">Categorias</Badge>
                    Categorias Padrão (separadas por vírgula)
                  </Label>
                  <Textarea
                    id="categoriasPadrao"
                    placeholder="Sub-7, Sub-9, Sub-11, Sub-13, Sub-15, Sub-17"
                    rows={3}
                    {...registerRegras("categoriasPadrao")}
                  />
                  <p className="text-xs text-gray-500">Essas categorias aparecerão como padrão ao criar alunos</p>
                </div>

                {/* Suspensão automática */}
                <div className="space-y-6 p-6 border rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-6 w-6" />
                      Suspensão Automática por Atraso
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="ativarSuspensaoAutomatica">Ativar</Label>
                      <Switch id="ativarSuspensaoAutomatica" {...registerRegras("ativarSuspensaoAutomatica")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasAtrasoSuspensao" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Suspender escolinha após quantos dias de atraso? *
                    </Label>
                    <Input id="diasAtrasoSuspensao" type="number" min="1" placeholder="ex: 30" {...registerRegras("diasAtrasoSuspensao")} />
                    <p className="text-sm text-red-700">Após esse período, a escolinha será suspensa automaticamente até regularizar o pagamento.</p>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingRegras} size="lg" className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  {isSubmittingRegras ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando regras...
                    </>
                  ) : (
                    "Salvar Regras da Plataforma"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;