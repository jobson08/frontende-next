/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/configuracoes/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import {
  Loader2,
  Camera,
  Trash2,
  Building2,
  Activity,
  Trophy,
  DollarSign,
  CreditCard,
  Key,
  QrCode,
  Wallet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import api from "@/src/lib/api";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";

// Schemas Zod
const geralSchema = z.object({
  nomeEscolinha: z.string().min(3, "Nome da escolinha é obrigatório"),
  mensagemBoasVindas: z.string().optional(),
});

const aulasExtrasSchema = z.object({
  ativarAulasExtras: z.boolean(),
});

const crossfitSchema = z.object({
  ativarCrossfit: z.boolean(),
  mostrarNavbar: z.boolean().default(false),
  mostrarSidebar: z.boolean().default(false),
});

const pagamentoSchema = z.object({
  gateway: z.enum(["stripe", "pagseguro", "pix", "nenhum"]),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  pagseguroEmail: z.string().email().optional(),
  pagseguroToken: z.string().optional(),
  pixChave: z.string().optional(),
  pixNomeTitular: z.string().optional(),
  pixBanco: z.string().optional(),
}).refine(
  (data) => {
    if (data.gateway === "stripe") return !!data.stripePublishableKey && !!data.stripeSecretKey;
    if (data.gateway === "pagseguro") return !!data.pagseguroEmail && !!data.pagseguroToken;
    if (data.gateway === "pix") return !!data.pixChave && !!data.pixNomeTitular;
    return true;
  },
  { message: "Preencha todos os campos obrigatórios do gateway selecionado", path: ["gateway"] }
);

type GeralFormData = z.infer<typeof geralSchema>;
type AulasExtrasForm = z.infer<typeof aulasExtrasSchema>;
type CrossfitForm = z.infer<typeof crossfitSchema>;
type PagamentoForm = z.infer<typeof pagamentoSchema>;

export default function ConfiguracoesAdminPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [crossfitBanner, setCrossfitBanner] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const crossfitInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { refreshConfig } = useEscolinhaConfig();

  // Formulários
  const geralForm = useForm<GeralFormData>({
    resolver: zodResolver(geralSchema),
  });

  const aulasExtrasForm = useForm<AulasExtrasForm>({
    resolver: zodResolver(aulasExtrasSchema),
    defaultValues: { ativarAulasExtras: false },
  });

  const crossfitForm = useForm<CrossfitForm>({
    resolver: zodResolver(crossfitSchema) as any,
    defaultValues: {
      ativarCrossfit: false,
      mostrarNavbar: false,
      mostrarSidebar: false,
    },
  });

  const pagamentoForm = useForm<PagamentoForm>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: { gateway: "nenhum" },
  });

  const gatewaySelecionado = pagamentoForm.watch("gateway");
  const ativarCrossfit = crossfitForm.watch("ativarCrossfit");

  // Carrega dados reais do backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/tenant/config/escolinha");
        const config = res.data.data || {};

        geralForm.reset({
          nomeEscolinha: config.nome || "Gol de Placa Academy",
         
        });

        aulasExtrasForm.reset({
          ativarAulasExtras: config.aulasExtrasAtivas ?? false,
        });

        crossfitForm.reset({
          ativarCrossfit: config.crossfitAtivo ?? false,
          mostrarNavbar: config.mostrarCrossfitNavbar ?? false,
          mostrarSidebar: config.mostrarCrossfitSidebar ?? false,
        });

        pagamentoForm.reset({
          gateway: config.gatewayPagamento || "nenhum",
          stripePublishableKey: config.stripePublishableKey || "",
          stripeSecretKey: config.stripeSecretKey || "",
          pagseguroEmail: config.pagseguroEmail || "",
          pagseguroToken: config.pagseguroToken || "",
          pixChave: config.pixChave || "",
          pixNomeTitular: config.pixNomeTitular || "",
          pixBanco: config.pixBanco || "",
        });

        if (config.logoUrl) setLogoPreview(config.logoUrl);
        if (config.crossfitBannerUrl) setCrossfitBanner(config.crossfitBannerUrl);

        toast.success("Configurações carregadas!");
      } catch (err) {
        console.error("Erro ao carregar configs:", err);
        toast.error("Falha ao carregar configurações", {
          description: "Usando valores padrão",
        });

        geralForm.reset({ nomeEscolinha: "Gol de Placa Academy", mensagemBoasVindas: "" });
        aulasExtrasForm.reset({ ativarAulasExtras: false });
        crossfitForm.reset({ ativarCrossfit: false, mostrarNavbar: false, mostrarSidebar: false });
        pagamentoForm.reset({ gateway: "nenhum" });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [geralForm, aulasExtrasForm, crossfitForm, pagamentoForm]);

  // Salvamentos
  const salvarGeral = async (data: GeralFormData) => {
    setIsSaving(true);
    try {
      await api.put("/tenant/config/geral", data);
      toast.success("Geral salvo!");
      window.location.reload(); // recarrega tudo forçado
    } catch (err: any) {
      toast.error("Erro ao salvar geral", { description: err.response?.data?.error });
    } finally {
      setIsSaving(false);
    }
  };

const salvarAulasExtras = async () => {  // ← sem parâmetro (data)
  setIsSaving(true);
  try {
    // Sempre pega os valores ATUAIS do form no momento do clique
    const currentData = aulasExtrasForm.getValues();

    // Log para debug (remova depois)
    console.log('PAYLOAD ENVIADO PARA AULAS EXTRAS:', currentData);

    await api.put("/tenant/config/aulas-extras", currentData);

    toast.success("Aulas extras salvas!");

    // Atualiza o contexto global → navbar/sidebar reagem imediatamente
    await refreshConfig();

    // Reseta o form com os valores que acabaram de ser enviados
    aulasExtrasForm.reset(currentData);

    // Opcional: força validação visual do form
    aulasExtrasForm.trigger();
  } catch (err: any) {
    console.error('ERRO AO SALVAR AULAS EXTRAS:', err.response?.data || err.message);
    toast.error("Erro ao salvar aulas extras", {
      description: err.response?.data?.error || "Tente novamente",
    });
  } finally {
    setIsSaving(false);
  }
};

const salvarCrossfit = async () => {  // ← SEM parâmetro (data)
  setIsSaving(true);
  try {
    // Pega os valores ATUAIS do form no momento do clique
    const currentData = crossfitForm.getValues();

    console.log('VALORES ENVIADOS PARA O BACKEND:', currentData);

    const response = await api.put("/tenant/config/crossfit", currentData);
    console.log('RESPOSTA DO BACKEND:', response.data);

    toast.success("CrossFit salvo!");

    // Atualiza o contexto global (Navbar/Sidebar vão reagir)
    await refreshConfig();

    // Atualiza o form local com os valores enviados (ou do backend, se preferir)
    crossfitForm.reset(currentData);
  } catch (err: any) {
    console.error('ERRO NO PUT CROSSFIT:', err.response?.data || err.message);
    toast.error("Erro ao salvar CrossFit", { description: err.response?.data?.error || err.message });
  } finally {
    setIsSaving(false);
  }
};

  const salvarPagamento = async (data: PagamentoForm) => {
    setIsSaving(true);
    try {
      await api.put("/tenant/config/pagamentos", data);
      toast.success("Pagamentos salvo!");
      window.location.reload(); // recarrega tudo forçado
    } catch (err: any) {
      toast.error("Erro ao salvar pagamentos");
    } finally {
      setIsSaving(false);
    }
  };

  // Uploads
  const handleLogoUpload = async () => {
    const file = logoInputRef.current?.files?.[0];
    if (!file) return toast.warning("Selecione uma imagem");

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await api.post("/tenant/config/logo", formData);
      setLogoPreview(res.data.data.logoUrl);
      toast.success("Logo atualizada!");
    } catch (err: any) {
      toast.error("Erro no upload da logo");
    }
  };

  const handleCrossfitBannerUpload = async () => {
    const file = crossfitInputRef.current?.files?.[0];
    if (!file) return toast.warning("Selecione uma imagem");

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const res = await api.post("/tenant/config/crossfit-banner", formData);
      setCrossfitBanner(res.data.data.crossfitBannerUrl);
      toast.success("Banner atualizado!");
    } catch (err: any) {
      toast.error("Erro no upload do banner");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações da Escolinha</h1>
        <p className="text-gray-600 text-lg mt-2">Personalize sua escolinha e ative funcionalidades extras</p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="valores">Valores e Cobrança</TabsTrigger>
          <TabsTrigger value="aulasextras">Aulas Extras</TabsTrigger>
          <TabsTrigger value="crossfit">CrossFit</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        {/* ABA GERAL */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={geralForm.handleSubmit(salvarGeral)} className="space-y-8">
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-40 w-40 ring-4 ring-blue-100">
                    <AvatarImage src={logoPreview || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-4xl font-bold">
                      {geralForm.watch("nomeEscolinha")?.slice(0, 2) || "GP"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      Alterar logo
                    </Button>
                    {logoPreview && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => setLogoPreview(null)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>

                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                </div>

                <div className="space-y-2">
                  <Label>Nome da Escolinha</Label>
                  <Input {...geralForm.register("nomeEscolinha")} />
                </div>

                <div className="space-y-2">
                  <Label>Mensagem de Boas-vindas</Label>
                  <Textarea rows={4} {...geralForm.register("mensagemBoasVindas")} />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={geralForm.formState.isSubmitting || isSaving}>
                    {geralForm.formState.isSubmitting || isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Geral"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA VALORES */}
        <TabsContent value="valores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Valores dos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Mensalidade Futebol</Label>
                  <Input type="number" step="0.01" defaultValue="150.00" className="text-xl font-bold h-10" />
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Dia de Vencimento</Label>
                  <Input type="number" min="1" max="31" defaultValue="10" className="w-20 text-center h-10" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="lg" className="bg-green-600">
                  Salvar Valores
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA AULAS EXTRAS */}
        <TabsContent value="aulasextras">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Aulas Extras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div>
                  <Label className="text-lg font-semibold">Ativar Aulas Extras</Label>
                  <p className="text-sm text-gray-600">Permitir solicitação de aulas individuais</p>
                </div>
                <Switch
                  checked={aulasExtrasForm.watch("ativarAulasExtras")}
                  onCheckedChange={(checked) => aulasExtrasForm.setValue("ativarAulasExtras", checked)}
                />
              </div>

              {aulasExtrasForm.watch("ativarAulasExtras") && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Nome da aula" />
                    <Input type="number" placeholder="Valor (R$)" />
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-yellow-600">Adicionar Aula Extra</Button>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aula</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Condicionamento</TableCell>
                        <TableCell>R$ 80</TableCell>
                        <TableCell>45 min</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">Editar</Button>
                          <Button size="sm" variant="ghost" className="text-red-600">Excluir</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={aulasExtrasForm.handleSubmit(salvarAulasExtras)}
                  disabled={aulasExtrasForm.formState.isDirty|| isSaving}
                  className="bg-yellow-600"
                >
                 {isSaving ? "Salvando..." : "Salvar Aulas Extras"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA CROSSFIT */}
        <TabsContent value="crossfit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-red-600" />
                CrossFit para Pais e Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div>
                  <Label className="text-lg font-semibold">Ativar CrossFit</Label>
                  <p className="text-sm text-gray-600">Ofereça aulas para adultos</p>
                </div>
                  <Switch
                    checked={ativarCrossfit}
                    onCheckedChange={(checked) => {
                      crossfitForm.setValue("ativarCrossfit", checked, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
                      crossfitForm.setValue("mostrarNavbar", checked, { shouldDirty: true });
                      crossfitForm.setValue("mostrarSidebar", checked, { shouldDirty: true });
                    }}
                  />
              </div>

              {ativarCrossfit && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-4 py-6 border-b">
                    <Avatar className="h-40 w-40 ring-4 ring-red-100">
                      <AvatarImage src={crossfitBanner || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-4xl font-bold">
                        CF
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => crossfitInputRef.current?.click()}>
                        <Camera className="mr-2 h-4 w-4" />
                        Alterar banner
                      </Button>
                      {crossfitBanner && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => setCrossfitBanner(null)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      )}
                    </div>

                    <input type="file" accept="image/*" ref={crossfitInputRef} onChange={handleCrossfitBannerUpload} className="hidden" />
                  </div>

                 {/* <div className="space-y-6 p-6 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-xl font-bold text-red-800">Visibilidade</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Mostrar na Navbar</Label>
                        <p className="text-sm text-gray-600">Menu superior</p>
                      </div>
                      <Switch checked={crossfitForm.watch("mostrarNavbar")} onCheckedChange={(c) => crossfitForm.setValue("mostrarNavbar", c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Mostrar na Sidebar</Label>
                        <p className="text-sm text-gray-600">Menu lateral</p>
                      </div>
                      <Switch checked={crossfitForm.watch("mostrarSidebar")} onCheckedChange={(c) => crossfitForm.setValue("mostrarSidebar", c)} />
                    </div>
                  </div>
                  */}
                  {/* Campos extras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nome do serviço</Label>
                      <Input placeholder="ex: CrossFit FutElite Pais" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor mensal</Label>
                      <Input type="number" placeholder="ex: 149" />
                    </div>
                    <div className="space-y-2">
                      <Label>Professor responsável</Label>
                      <Input placeholder="ex: Professor Marcos" />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de vagas</Label>
                      <Input type="number" placeholder="ex: 15" />
                    </div>
                  </div>
                </div>
              )}
                <div className="flex justify-end">
                    <Button
                      onClick={salvarCrossfit}
                      disabled={!crossfitForm.formState.isDirty || isSaving}  // só habilita se mudou algo
                      className="bg-green-600"
                    >
                      {isSaving ? "Salvando..." : "Salvar CrossFit"}
                    </Button>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA PAGAMENTOS */}
        <TabsContent value="pagamentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Configuração de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={pagamentoForm.handleSubmit(salvarPagamento)} className="space-y-8">
                <div className="space-y-4">
                  <Label>Gateway</Label>
                  <Select value={gatewaySelecionado} onValueChange={(v) => pagamentoForm.setValue("gateway", v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="pagseguro">PagSeguro</SelectItem>
                      <SelectItem value="pix">PIX Manual</SelectItem>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos condicionais */}
                {gatewaySelecionado === "stripe" && (
                  <div className="p-6 bg-blue-50 rounded-lg border space-y-4">
                    <h3 className="font-bold">Stripe</h3>
                    <Input {...pagamentoForm.register("stripePublishableKey")} placeholder="Publishable Key" />
                    <Input {...pagamentoForm.register("stripeSecretKey")} type="password" placeholder="Secret Key" />
                  </div>
                )}

                {gatewaySelecionado === "pagseguro" && (
                  <div className="p-6 bg-green-50 rounded-lg border space-y-4">
                    <h3 className="font-bold">PagSeguro</h3>
                    <Input {...pagamentoForm.register("pagseguroEmail")} placeholder="Email" />
                    <Input {...pagamentoForm.register("pagseguroToken")} type="password" placeholder="Token" />
                  </div>
                )}

                {gatewaySelecionado === "pix" && (
                  <div className="p-6 bg-purple-50 rounded-lg border space-y-4">
                    <h3 className="font-bold">PIX</h3>
                    <Input {...pagamentoForm.register("pixChave")} placeholder="Chave PIX" />
                    <Input {...pagamentoForm.register("pixNomeTitular")} placeholder="Nome do Titular" />
                    <Input {...pagamentoForm.register("pixBanco")} placeholder="Banco (opcional)" />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving} className="bg-green-600">
                    {isSaving ? "Salvando..." : "Salvar Pagamentos"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}