// src/app/dashboard/responsavel/page.tsx (atualizado)
"use client";

import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, AlertCircle, Trophy, Key, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

// Schema para troca de senha
const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type SenhaFormData = z.infer<typeof senhaSchema>;

const ResponsavelDashboardPage = () => {    //Inicio da função

  // CONFIGURAÇÃO DA ESCOLINHA (em produção vem do Supabase ou contexto) esconder card renda extra
  const { aulasExtrasAtivas } = useEscolinhaConfig();
  const [openModalSenha, setOpenModalSenha] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
  });

  const onSubmitSenha = async (data: SenhaFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Senha do responsável alterada:", data.novaSenha);
      toast.success("Senha alterada com sucesso!");
      reset();
      setOpenModalSenha(false);
    } catch {
      toast.error("Erro ao alterar senha");
    }
  };

  const responsavel = {
    name: "Ana Clara Santos",
    filhos: [
      { name: "Enzo Gabriel", idade: 10, categoria: "Sub-11", statusMensalidade: "Paga" },
      { name: "Maria Luiza", idade: 8, categoria: "Sub-9", statusMensalidade: "Pendente" },
    ],
  };

  // CONFIGURAÇÃO DA ESCOLINHA (em produção vem do Supabase ou contexto)


  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho com botão de troca de senha */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold">Olá, {responsavel.name}!</h1>
          <p className="text-gray-600 text-lg mt-2">Acompanhe o progresso dos seus filhos</p>
        </div>

        {/* BOTÃO TROCA DE SENHA */}
        <Dialog open={openModalSenha} onOpenChange={setOpenModalSenha}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Key className="h-4 w-4" />
              Trocar Senha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Trocar Senha</DialogTitle>
              <DialogDescription>
                Para maior segurança, troque a senha temporária recebida por e-mail.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmitSenha)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha atual</Label>
                <Input id="senhaAtual" type="password" {...register("senhaAtual")} />
                {errors.senhaAtual && <p className="text-sm text-red-600">{errors.senhaAtual.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <Input id="novaSenha" type="password" {...register("novaSenha")} />
                {errors.novaSenha && <p className="text-sm text-red-600">{errors.novaSenha.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                <Input id="confirmarSenha" type="password" {...register("confirmarSenha")} />
                {errors.confirmarSenha && <p className="text-sm text-red-600">{errors.confirmarSenha.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Alterando..." : "Confirmar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpenModalSenha(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CARD DESTAQUE: SOLICITAR AULA EXTRA — SÓ APARECE SE ATIVADO */}
      {aulasExtrasAtivas && (
        <Card className="border-2 border-yellow-400 bg-linear-to-r from-yellow-50 to-orange-50 hover:shadow-2xl transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-yellow-800">
              <Trophy className="h-10 w-10 text-yellow-600" />
              Quer acelerar o desenvolvimento do seu filho?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-gray-700">
              Solicite <strong>aulas extras individuais</strong> com foco em finalização, condicionamento físico, drible, goleiro e muito mais!
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Aulas personalizadas com os melhores treinadores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Horários flexíveis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                A partir de <strong>R$ 70</strong> por aula
              </li>
            </ul>

            <Button 
              asChild 
              size="lg" 
              className="w-full mt-6 bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg"
            >
              <Link href="/dashboarduser/responsavel-dashboard/aulas-extras">
                <Trophy className="mr-2 h-5 w-5" />
                Solicitar Aula Extra Agora
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cards dos Filhos */}
      <div className="grid gap-6 md:grid-cols-2">
        {responsavel.filhos.map((filho) => (
          <Card key={filho.name}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-2xl">
                    {filho.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{filho.name}</CardTitle>
                  <p className="text-gray-600">{filho.idade} anos • {filho.categoria}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mensalidade</span>
                <Badge className={filho.statusMensalidade === "Paga" ? "bg-green-600" : "bg-orange-600"}>
                  {filho.statusMensalidade}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Próximo treino: Segunda - 18:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Próximo treino: Quarta - 18:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-gray-500" />
                <span>Frequência este mês: 16 treinos</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aviso de Mensalidade Pendente */}
      {responsavel.filhos.some(f => f.statusMensalidade === "Pendente") && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Atenção: Mensalidade Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              A mensalidade de Maria Luiza está pendente. Regularize para evitar suspensão.
            </p>
            <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
              Pagar agora
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResponsavelDashboardPage;