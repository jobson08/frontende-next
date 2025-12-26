// src/app/dashboard/responsavel/filhos/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Phone, Mail, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

// Mock (em produção vem do banco)
const alunosMock = [
    {
        id: "1",
        name: "Enzo Gabriel Silva",
        idade: 10,
        categoria: "Sub-11",
        status: "ATIVO",
        frequenciaMes: 18,
        metaSemanal: 4,
        treinosFeitosSemana: 3,
        proximosTreinos: 5,
        nivel: "Avançado",
        treinador: "Rafael Lima",
        emailResponsavel: "ana@email.com",
        phoneResponsavel: "(11) 97777-6666",
        observacoes: "Alergia a amendoim. Usa óculos para leitura.",
    },
    // outros filhos...
];

const DetalhesFilhoPage = () => {
    const { id } = useParams();
    const filho = alunosMock.find(a => a.id === id);

    if (!filho) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Aluno não encontrado</h1>
                <Button asChild>
                    <Link href="/dashboarduser/responsavel-dashboard/filhos">Voltar para meus filhos</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Cabeçalho do filho */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboarduser/responsavel-dashboard/filhos">
                     <ChevronLeft className="h-5 w-5" /> Voltar
                 </Link>
                </Button>
              </div>
            <div className="flex items-center gap-2">

                <Avatar className="h-24 w-24 ring-4 ring-purple-600">
                    <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-4xl font-bold">
                        {filho.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-1xl font-bold">{filho.name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-linear-to-br from-purple-600 to-pink-600 text-xs px-4 py-1">
                            {filho.categoria}
                        </Badge>
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                            {filho.nivel}
                        </Badge>
                    </div>
                    <p className="text-gray-600 mt-2">{filho.idade} anos • Treinador: {filho.treinador}</p>
                </div>
            </div>

            {/* Cards de resumo */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-3x1 font-medium">Treinos esta semana</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-center py-2 font-bold">{filho.treinosFeitosSemana}/{filho.metaSemanal}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-3x1 font-medium">Próximos treinos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-center py-2 font-bold">{filho.proximosTreinos}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-3x1 font-medium">Frequência mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-center py-2 font-bold">{filho.frequenciaMes}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-3x1 font-medium">Avaliação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-center py-2 font-bold text-yellow-500">4.8</div>
                    </CardContent>
                </Card>
            </div>

            {/* Informações adicionais */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contato do Responsável</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <span>{filho.emailResponsavel}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <span>{filho.phoneResponsavel}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{filho.observacoes || "Nenhuma observação registrada."}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DetalhesFilhoPage;