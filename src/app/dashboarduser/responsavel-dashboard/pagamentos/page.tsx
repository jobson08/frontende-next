// src/app/dashboard/responsavel/pagamentos/page.tsx
"use client";

import { DollarSign, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useState } from "react";

const PagamentosPage = () => {
  const [copiado, setCopiado] = useState(false);

  const pixCode = "00020126580014BR.GOV.BCB.PIX0136123456789012345678901234567890123456789012345204000053039865802BR5925NOME DO RECEBEDOR6009SAO PAULO61080548999962230518REF1234567890123456786304ABCD";

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const mensalidades = [
    { mes: "Dezembro 2025", valor: "R$ 250,00", status: "Pendente", vencimento: "30/12/2025" },
    { mes: "Novembro 2025", valor: "R$ 250,00", status: "Paga", vencimento: "30/11/2025" },
    { mes: "Outubro 2025", valor: "R$ 250,00", status: "Paga", vencimento: "30/10/2025" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Pagamentos</h1>

      {/* Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">R$ 250,00</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mensalidades Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30/12/2025</div>
          </CardContent>
        </Card>
      </div>

      {/* PIX para pagamento */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Pagar com PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all">
            {pixCode}
          </div>
          <Button onClick={copiarPix} className="w-full">
            {copiado ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar código PIX
              </>
            )}
          </Button>
          <p className="text-sm text-gray-600 text-center">
            Valor: R$ 250,00 • Vencimento: 30/12/2025
          </p>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mensalidades.map((m) => (
              <div key={m.mes} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{m.mes}</p>
                  <p className="text-sm text-gray-600">Vencimento: {m.vencimento}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{m.valor}</p>
                  <Badge className={m.status === "Paga" ? "bg-green-600" : "bg-orange-600"}>
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentosPage;