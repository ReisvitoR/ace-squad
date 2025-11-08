import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, Partida } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, ArrowLeft, UserPlus, LogOut as LogOutIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PartidaDetalhes() {
  const { id } = useParams();
  const [partida, setPartida] = useState<Partida | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPartida();
  }, [id]);

  const loadPartida = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await api.getPartida(parseInt(id));
      setPartida(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar partida",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipar = async () => {
    if (!id) return;
    
    try {
      await api.participarPartida(parseInt(id));
      toast({
        title: "Sucesso!",
        description: "Você entrou na partida!",
      });
      loadPartida();
    } catch (error) {
      toast({
        title: "Erro ao participar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleSair = async () => {
    if (!id) return;
    
    try {
      await api.sairPartida(parseInt(id));
      toast({
        title: "Você saiu da partida",
        description: "Até a próxima!",
      });
      loadPartida();
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!partida) return null;

  const isOrganizador = user?.id === partida.organizador_id;
  const isFull = partida.participantes_count >= partida.max_participantes;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2 transition-smooth hover:gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-gradient shadow-card animate-slide-up border-2">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{partida.titulo}</h1>
                    <CategoryBadge categoria={partida.categoria} className="text-sm" />
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {partida.tipo.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {partida.descricao && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground">{partida.descricao}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data e Hora</p>
                      <p className="font-semibold">
                        {format(new Date(partida.data_partida), "dd MMM yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-semibold">{partida.local}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Participantes</p>
                      <p className="font-semibold">
                        {partida.participantes_count}/{partida.max_participantes}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {partida.estou_participando ? (
                    <Button
                      onClick={handleSair}
                      variant="destructive"
                      className="flex-1 gap-2 transition-bounce"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Sair da Partida
                    </Button>
                  ) : (
                    <Button
                      onClick={handleParticipar}
                      disabled={isFull}
                      className="flex-1 gap-2 transition-bounce"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isFull ? "Partida Lotada" : "Participar"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="card-gradient shadow-card animate-slide-up border-2">
              <CardHeader>
                <h3 className="font-bold text-lg">Participantes</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {partida.organizador && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {partida.organizador.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{partida.organizador.nome}</p>
                      <p className="text-xs text-muted-foreground">Organizador</p>
                    </div>
                    <Badge variant="secondary">{partida.organizador.nivel}</Badge>
                  </div>
                )}

                {partida.participantes && partida.participantes.length > 0 ? (
                  partida.participantes.map((participante) => (
                    <div
                      key={participante.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {participante.nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{participante.nome}</p>
                      </div>
                      <Badge variant="outline">{participante.nivel}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum participante ainda
                  </p>
                )}
              </CardContent>
            </Card>

            {isOrganizador && (
              <Button
                variant="outline"
                className="w-full gap-2 transition-bounce"
                onClick={() => toast({ title: "Em breve", description: "Funcionalidade de convite em desenvolvimento" })}
              >
                <UserPlus className="w-4 h-4" />
                Convidar Jogador
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
