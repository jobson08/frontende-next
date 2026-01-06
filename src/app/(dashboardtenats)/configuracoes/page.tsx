// src/app/(dashboard)/configuracoes/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { Loader2, Camera, Trash2, Building2, Activity, Trophy, Bell, DollarSign, CreditCard, Key, QrCode, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

// Schemas
const geralSchema = z.object({
  nomeEscolinha: z.string().min(3),
  mensagemBoasVindas: z.string().optional(),
});

const aulasExtrasSchema = z.object({
  ativarAulasExtras: z.boolean(),
});

const crossfitSchema = z.object({
  ativarCrossfit: z.boolean(),
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
}).refine((data) => {
  if (data.gateway === "stripe") return !!data.stripePublishableKey && !!data.stripeSecretKey;
  if (data.gateway === "pagseguro") return !!data.pagseguroEmail && !!data.pagseguroToken;
  if (data.gateway === "pix") return !!data.pixChave && !!data.pixNomeTitular;
  return true;
}, { 
  message: "Preencha todos os campos obrigatórios do gateway selecionado",
  path: ["gateway"]
});

type GeralFormData = z.infer<typeof geralSchema>;
type PagamentoForm = z.infer<typeof pagamentoSchema>;

const ConfiguracoesAdminPage = () => {
  // Estados para imagens
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [crossfitBanner, setCrossfitBanner] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const crossfitInputRef = useRef<HTMLInputElement>(null);

  // Estados para switches
  const [ativarAulasExtras, setAtivarAulasExtras] = useState(false);
  const [ativarCrossfit, setAtivarCrossfit] = useState(false);

  // Config atual de pagamento (mock)
  const [configPagamento, setConfigPagamento] = useState<PagamentoForm | null>(null);
  const [isLoadingPagamento, setIsLoadingPagamento] = useState(false);

  // Form Geral
  const geralForm = useForm<GeralFormData>({
    resolver: zodResolver(geralSchema),
    defaultValues: {
      nomeEscolinha: "Gol de Placa Academy",
      mensagemBoasVindas: "Bem-vindo à nossa família! Aqui seu filho vai crescer jogando futebol com alegria e disciplina.",
    },
  });

  // Form Pagamentos
  const pagamentoForm = useForm<PagamentoForm>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      gateway: "nenhum",
    },
  });

  const gatewaySelecionado = pagamentoForm.watch("gateway");

  // Carrega config de pagamento (mock)
  useEffect(() => {
    const mockPagamento: PagamentoForm = {
      gateway: "stripe",
      stripePublishableKey: "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX",
      stripeSecretKey: "",
      pagseguroEmail: "",
      pagseguroToken: "",
      pixChave: "",
      pixNomeTitular: "",
      pixBanco: "",
    };
    setConfigPagamento(mockPagamento);
    pagamentoForm.setValue("gateway", mockPagamento.gateway);
    pagamentoForm.setValue("stripePublishableKey", mockPagamento.stripePublishableKey);
  }, [pagamentoForm]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCrossfitBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCrossfitBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setLogoPreview(null);
  const removeCrossfitBanner = () => setCrossfitBanner(null);

  const salvarGeral = async (data: GeralFormData) => {
    await new Promise(r => setTimeout(r, 1200));
    toast.success("Configurações gerais atualizadas!");
  };

  const salvarPagamento = async (data: PagamentoForm) => {
    setIsLoadingPagamento(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success("Configuração de pagamentos salva!");
      setConfigPagamento(data);
    } catch {
      toast.error("Erro ao salvar configuração de pagamento");
    } finally {
      setIsLoadingPagamento(false);
    }
  };

  const getGatewayName = (gateway: PagamentoForm["gateway"]) => {
    switch (gateway) {
      case "stripe": return "Stripe";
      case "pagseguro": return "PagSeguro";
      case "pix": return "PIX Manual";
      default: return "Nenhum";
    }
  };

  const getGatewayIcon = (gateway: PagamentoForm["gateway"]) => {
    switch (gateway) {
      case "stripe": return <CreditCard className="h-6 w-6" />;
      case "pagseguro": return <Wallet className="h-6 w-6" />;
      case "pix": return <QrCode className="h-6 w-6" />;
      default: return <AlertCircle className="h-6 w-6" />;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações da Escolinha</h1>
        <p className="text-gray-600 text-lg mt-2">Personalize sua escolinha e ative funcionalidades extras</p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aulasextras">Aulas Extras</TabsTrigger>
          <TabsTrigger value="crossfit">CrossFit</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
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
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-40 w-40 ring-4 ring-blue-100">
                    <AvatarImage src={logoPreview || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-4xl font-bold">
                      GP
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

                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeEscolinha">Nome da Escolinha</Label>
                  <Input id="nomeEscolinha" {...geralForm.register("nomeEscolinha")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagemBoasVindas">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="mensagemBoasVindas"
                    rows={4}
                    {...geralForm.register("mensagemBoasVindas")}
                  />
                </div>

                <Button type="submit" disabled={geralForm.formState.isSubmitting} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  {geralForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Configurações Gerais"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA AULAS EXTRAS */}
        <TabsContent value="aulasextras">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Aulas Extras Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div>
                  <Label className="text-lg font-semibold">Permitir aulas extras</Label>
                  <p className="text-sm text-gray-600 mt-1">Alunos poderão solicitar aulas individuais (finalização, condicionamento, etc)</p>
                </div>
                <Switch checked={ativarAulasExtras} onCheckedChange={setAtivarAulasExtras} />
              </div>

              {ativarAulasExtras && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Nome da aula (ex: Finalização)" />
                    <Input type="number" placeholder="Valor (R$)" />
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600">
                    Adicionar Aula Extra
                  </Button>

                  {/* Tabela de aulas extras cadastradas (exemplo) */}
                  <div className="border rounded-lg">
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
                          <TableCell>Condicionamento Físico</TableCell>
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
                </div>
              )}
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
                  <Label className="text-lg font-semibold">Ativar CrossFit para adultos</Label>
                  <p className="text-sm text-gray-600 mt-1">Ofereça aulas de CrossFit enquanto os filhos treinam futebol</p>
                </div>
                <Switch checked={ativarCrossfit} onCheckedChange={setAtivarCrossfit} />
              </div>

              {ativarCrossfit && (
                <div className="space-y-8">
                  {/* Banner do CrossFit */}
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
                        <Button type="button" variant="destructive" size="sm" onClick={removeCrossfitBanner}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      )}
                    </div>

                    <input type="file" accept="image/*" ref={crossfitInputRef} onChange={handleCrossfitBannerChange} className="hidden" />
                  </div>

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
                      <Label>Limite de vagas por turma</Label>
                      <Input type="number" placeholder="ex: 15" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Horários disponíveis</Label>
                    <Textarea 
                      placeholder="Segunda e Quarta: 18h-19h\nTerça e Quinta: 19h-20h\nSábado: 9h-10h"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição para os pais</Label>
                    <Textarea 
                      placeholder="Enquanto seu filho treina futebol, você faz CrossFit com os melhores professores! Aulas no mesmo horário do treino infantil."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                    Salvar Configurações CrossFit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA PAGAMENTOS */}
        <TabsContent value="pagamentos">
          {/* Código completo da configuração de pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Configuração de Pagamentos
              </CardTitle>
              <CardDescription>
                Configure como a escolinha vai receber as mensalidades dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Status Atual */}
              {configPagamento && (
                <Card className="mb-8 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {getGatewayIcon(configPagamento.gateway)}
                      Gateway Atual: {getGatewayName(configPagamento.gateway)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="text-lg px-6 py-2 bg-green-600">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Configurado e ativo
                    </Badge>
                    <p className="text-gray-700 mt-4">
                      Os responsáveis estão pagando via {getGatewayName(configPagamento.gateway)}.
                    </p>
                  </CardContent>
                </Card>
              )}

              <form onSubmit={pagamentoForm.handleSubmit(salvarPagamento)} className="space-y-8">
                <div className="space-y-4">
                  <Label>Gateway de Pagamento</Label>
                  <Select
                    value={gatewaySelecionado}
                    onValueChange={(value) => pagamentoForm.setValue("gateway", value as PagamentoForm["gateway"])}
                  >
                    <SelectTrigger className="w-full h-14 text-lg">
                      <SelectValue placeholder="Selecione o gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                          Stripe (Cartão de Crédito)
                        </div>
                      </SelectItem>
                      <SelectItem value="pagseguro">
                        <div className="flex items-center gap-3">
                          <Wallet className="h-6 w-6 text-green-600" />
                          PagSeguro (Boleto, Cartão, PIX)
                        </div>
                      </SelectItem>
                      <SelectItem value="pix">
                        <div className="flex items-center gap-3">
                          <QrCode className="h-6 w-6 text-purple-600" />
                          PIX Manual
                        </div>
                      </SelectItem>
                      <SelectItem value="nenhum">
                        <div className="flex items-center gap-3">
                          Nenhum (pagamento externo)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos Stripe */}
                {gatewaySelecionado === "stripe" && (
                  <div className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 text-blue-800">
                      <CreditCard className="h-8 w-8" />
                      <h3 className="text-xl font-bold">Configuração Stripe</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Chave Pública (Publishable Key)</Label>
                        <Input {...pagamentoForm.register("stripePublishableKey")} placeholder="pk_test_..." />
                      </div>
                      <div>
                        <Label>Chave Secreta (Secret Key)</Label>
                        <Input {...pagamentoForm.register("stripeSecretKey")} type="password" placeholder="sk_test_..." />
                        <p className="text-sm text-gray-600 mt-2">
                          <Key className="inline h-4 w-4 mr-1" />
                          Será criptografada no servidor
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos PagSeguro */}
                {gatewaySelecionado === "pagseguro" && (
                  <div className="space-y-6 p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 text-green-800">
                      <Wallet className="h-8 w-8" />
                      <h3 className="text-xl font-bold">Configuração PagSeguro</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Email da Conta</Label>
                        <Input {...pagamentoForm.register("pagseguroEmail")} type="email" placeholder="seu@email.com" />
                      </div>
                      <div>
                        <Label>Token de Integração</Label>
                        <Input {...pagamentoForm.register("pagseguroToken")} type="password" placeholder="XXXXXXXXXXXXXXXX" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos PIX */}
                {gatewaySelecionado === "pix" && (
                  <div className="space-y-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 text-purple-800">
                      <QrCode className="h-8 w-8" />
                      <h3 className="text-xl font-bold">Configuração PIX</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Chave PIX</Label>
                        <Input {...pagamentoForm.register("pixChave")} placeholder="CNPJ, email ou telefone" />
                      </div>
                      <div>
                        <Label>Nome do Titular</Label>
                        <Input {...pagamentoForm.register("pixNomeTitular")} placeholder="Nome completo" />
                      </div>
                      <div>
                        <Label>Banco (opcional)</Label>
                        <Input {...pagamentoForm.register("pixBanco")} placeholder="ex: Banco do Brasil" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoadingPagamento}
                    className="px-10 py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    {isLoadingPagamento ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-3 h-6 w-6" />
                        Salvar Configuração de Pagamento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA NOTIFICAÇÕES */}
        <TabsContent value="notificacoes">
          {/* ... código original da aba notificações ... */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesAdminPage;