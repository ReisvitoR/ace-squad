import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Trophy, Award } from "lucide-react";

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  const nivelColors = {
    noob: "bg-noob text-noob-foreground",
    amador: "bg-amador text-amador-foreground",
    intermediario: "bg-intermediario text-intermediario-foreground",
    proplayer: "bg-avancado text-avancado-foreground",
  };

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

        <div className="space-y-6">
          <Card className="card-gradient shadow-card animate-slide-up border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {user.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold mb-2">{user.nome}</h2>
                  <p className="text-muted-foreground mb-3">{user.email}</p>
                  <Badge className={`${nivelColors[user.tipo]} text-lg px-4 py-1`}>
                    {user.tipo.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="card-gradient shadow-card animate-scale-in border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Partidas Jogadas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {user.partidas_jogadas || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Continue jogando para subir de nível!
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient shadow-card animate-scale-in border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Vitórias</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {user.vitorias || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {user.partidas_jogadas && user.partidas_jogadas > 0
                    ? `${Math.round(((user.vitorias || 0) / user.partidas_jogadas) * 100)}% de taxa de vitória`
                    : "Jogue sua primeira partida!"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-gradient shadow-card animate-slide-up border-2">
            <CardHeader>
              <CardTitle>Progresso de Nível</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nível Atual</span>
                  <Badge className={nivelColors[user.tipo]}>{user.tipo.toUpperCase()}</Badge>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{
                      width: `${
                        user.tipo === "noob"
                          ? 25
                          : user.tipo === "amador"
                          ? 50
                          : user.tipo === "intermediario"
                          ? 75
                          : 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="text-center p-3 rounded-lg bg-noob/10">
                  <p className="text-xs text-muted-foreground mb-1">NOOB</p>
                  <p className="font-bold text-noob">Início</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amador/10">
                  <p className="text-xs text-muted-foreground mb-1">AMADOR</p>
                  <p className="font-bold text-amador">10+ partidas</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-intermediario/10">
                  <p className="text-xs text-muted-foreground mb-1">INTERMEDIÁRIO</p>
                  <p className="font-bold text-intermediario">25+ partidas</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-avancado/10">
                  <p className="text-xs text-muted-foreground mb-1">PROPLAYER</p>
                  <p className="font-bold text-avancado">50+ partidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
