// src/app/dashboard/responsavel/comunicados/page.tsx
"use client";

import { MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

const comunicados = [
  {
    id: "1",
    titulo: "Treino cancelado amanhã",
    data: "23/12/2025",
    mensagem: "Devido à chuva forte prevista, o treino de amanhã foi cancelado. Retomamos na quinta-feira.",
    lido: false,
  },
  {
    id: "2",
    titulo: "Amistoso no sábado",
    data: "20/12/2025",
    mensagem: "Temos amistoso marcado para sábado às 9h contra a Escolinha Gol de Placa. Presença obrigatória para Sub-11!",
    lido: true,
  },
  {
    id: "3",
    titulo: "Festa de final de ano",
    data: "15/12/2025",
    mensagem: "Confraternização de final de ano dia 20/12 às 15h. Tragam um prato doce ou salgado!",
    lido: true,
  },
];

const ComunicadosPage = () => {
  const naoLidos = comunicados.filter(c => !c.lido).length;

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Comunicados</h1>
        {naoLidos > 0 && (
          <Badge className="bg-red-600 text-lg px-4 py-1">
            {naoLidos} não lidos
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {comunicados.map((comunicado) => (
          <Card key={comunicado.id} className={!comunicado.lido ? "border-blue-400 bg-blue-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  {comunicado.titulo}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {comunicado.data}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{comunicado.mensagem}</p>
              {!comunicado.lido && (
                <Badge className="mt-4 bg-blue-600">Novo</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComunicadosPage;