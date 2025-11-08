import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Convite } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Convites() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadConvites();
  }, [user, navigate]);

  const loadConvites = async () => {
    setIsLoading(true);
    try {
      const data = await api.getConvitesRecebidos();
      setConvites(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar convites",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceitar = async (id: number) => {
    try {
      await api.aceitarConvite(id);
      toast({
        title: "Convite aceito!",
        description: "Você entrou na partida.",
      });
      loadConvites();
    } catch (error) {
      toast({
        title: "Erro ao aceitar convite",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleRecusar = async (id: number) => {
    try {
      await api.recusarConvite(id);
      toast({
        title: "Convite recusado",
        description: "O convite foi recusado.",
      });
      loadConvites();
    } catch (error) {
      toast({
        title: "Erro ao recusar convite",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const convitesPendentes = convites.filter((c) => c.status === "pendente");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2 transition-smooth hover:gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Meus Convites
          </h1>
          <p className="text-muted-foreground">
            {convitesPendentes.length} {convitesPendentes.length === 1 ? "convite pendente" : "convites pendentes"}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : convitesPendentes.length === 0 ? (
          <Card className="card-gradient shadow-card border-2">
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Você não tem convites pendentes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {convitesPendentes.map((convite) => (
              <Card
                key={convite.id}
                className="card-gradient shadow-card hover:shadow-card-hover transition-smooth animate-scale-in border-2"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {convite.partida?.titulo}
                      </CardTitle>
                      {convite.partida && (
                        <CategoryBadge categoria={convite.partida.categoria} />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {convite.partida && (
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data:</span>{" "}
                        <span className="font-semibold">
                          {format(new Date(convite.partida.data_partida), "dd MMM yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Local:</span>{" "}
                        <span className="font-semibold">{convite.partida.local}</span>
                      </div>
                    </div>
                  )}

                  {convite.mensagem && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Mensagem:</p>
                      <p className="text-sm">{convite.mensagem}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAceitar(convite.id)}
                      className="flex-1 gap-2 transition-bounce"
                    >
                      <Check className="w-4 h-4" />
                      Aceitar
                    </Button>
                    <Button
                      onClick={() => handleRecusar(convite.id)}
                      variant="outline"
                      className="flex-1 gap-2 transition-smooth hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                      Recusar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
