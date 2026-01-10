import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
     <Card className="w-full max-w-md shadow-2xl">
       <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Bem-vindo FutElite</CardTitle>
          <CardDescription className="text-lg">
            Acesse sua conta FutElite
          </CardDescription>
        </CardHeader>
    </Card>
    </div>
  );
}
