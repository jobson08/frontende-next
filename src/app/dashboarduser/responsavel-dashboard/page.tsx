// src/app/dashboard/responsavel/page.tsx
"use client";

import { Calendar, AlertCircle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";


const ResponsavelDeshboardPage = () => { // Inicio da função

   const responsavel = {
    name: "Ana Clara Santos",
    filhos: [
      { name: "Enzo Gabriel", idade: 10, categoria: "Sub-11", statusMensalidade: "Paga" },
      { name: "Maria Luiza", idade: 8, categoria: "Sub-9", statusMensalidade: "Pendente" },
    ],
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Olá, {responsavel.name}!</h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe o progresso dos seus filhos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {responsavel.filhos.map((filho) => (
          <Card key={filho.name}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-linear-to-r from-purple-600 to-pink-600 text-white text-2xl">
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
}
 
export default ResponsavelDeshboardPage;