import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Partidas Disponíveis
            </h1>
            <p className="text-muted-foreground">
              Encontre a partida perfeita para seu nível
            </p>
          </div>
          
          <Button
            onClick={() => navigate("/criar-partida")}
            className="gap-2 font-semibold transition-bounce"
          >
            <Plus className="w-4 h-4" />
            Nova Partida
          </Button>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando partidas...</p>
        </div>
      </main>
    </div>
  );
}
