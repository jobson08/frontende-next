// src/app/dashboard/responsavel/filhos/page.tsx
"use client";

import { Calendar, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import Link from "next/link";

// Mock dos filhos do responsável logado
const filhosMock = [
  {
    id: "1",
    name: "Enzo Gabriel Silva",
    idade: 10,
    categoria: "Sub-11",
    statusMensalidade: "Paga",
    frequenciaMes: 18,
    proximosTreinos: 5,
  },
  {
    id: "2",
    name: "Maria Luiza Silva",
    idade: 8,
    categoria: "Sub-9",
    statusMensalidade: "Pendente",
    frequenciaMes: 15,
    proximosTreinos: 4,
  },
];

const FilhosPage = () => {      //inicio da função
  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Meus Filhos</h1>
        <p className="text-gray-600 text-lg mt-2">Acompanhe o progresso de cada filho na escolinha</p>
      </div>

      {/* Grid de Cards dos Filhos */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filhosMock.map((filho) => (
          <Card key={filho.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-5">
                <Avatar className="h-24 w-24 ring-4 ring-purple-100">
                  <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-3xl font-bold">
                    {filho.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{filho.name}</CardTitle>
                  <p className="text-gray-600 mt-1">
                    {filho.idade} anos • {filho.categoria}
                  </p>
                  <div className="mt-3">
                    <Badge 
                      className={filho.statusMensalidade === "Paga" ? "bg-green-600" : "bg-orange-600"}
                    >
                      Mensalidade: {filho.statusMensalidade}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Frequência e Próximos Treinos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Frequência mensal</p>
                    <p className="text-xl font-bold">{filho.frequenciaMes} treinos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Próximos treinos</p>
                    <p className="text-xl font-bold">{filho.proximosTreinos}</p>
                  </div>
                </div>
              </div>

              {/* Botão Ver Detalhes */}
              <Button className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                <Link href={`/dashboarduser/responsavel-dashboard/filhos/${filho.id}`}>
                  Ver detalhes completos
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilhosPage;