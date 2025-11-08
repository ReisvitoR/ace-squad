import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PartidaStatus } from "@/components/PartidaStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, Partida, User } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, ArrowLeft, UserPlus, LogOut as LogOutIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PartidaDetalhes() {
  const { id } = useParams();
  const [partida, setPartida] = useState<Partida | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConviteDialog, setShowConviteDialog] = useState(false);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [sendingConvite, setSendingConvite] = useState(false);
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

  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const data = await api.getUsuarios(0, 100);
      // Filtra usuários que já estão participando ou são o organizador
      const participantesIds = partida?.participantes?.map(p => p.id) || [];
      const filtered = data.filter(u => 
        u.id !== user?.id && 
        u.id !== partida?.organizador_id &&
        !participantesIds.includes(u.id)
      );
      setUsuarios(filtered);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleOpenConviteDialog = () => {
    setShowConviteDialog(true);
    loadUsuarios();
  };

  const handleEnviarConvite = async () => {
    if (!selectedUser || !id) return;

    setSendingConvite(true);
    try {
      await api.enviarConvite(selectedUser.id, parseInt(id), mensagem || undefined);
      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${selectedUser.nome}`,
      });
      setShowConviteDialog(false);
      setSelectedUser(null);
      setMensagem("");
    } catch (error) {
      toast({
        title: "Erro ao enviar convite",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSendingConvite(false);
    }
  };



  const filteredUsuarios = usuarios.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  const numParticipantes = partida.participantes?.length ?? partida.total_participantes;
  const isFull = numParticipantes >= partida.max_participantes;
  const estouParticipando = partida.participantes?.some(p => p.id === user?.id) || false;

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
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{partida.titulo}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge categoria={partida.categoria} className="text-sm" />
                      <PartidaStatus status={partida.status} />
                    </div>
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
                        {numParticipantes}/{partida.max_participantes}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {partida.participantes_confirmados} confirmado(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col gap-2 pt-4">
                  {estouParticipando ? (
                    <Button
                      onClick={handleSair}
                      variant="destructive"
                      className="w-full gap-2 transition-bounce"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Sair da Partida
                    </Button>
                  ) : (
                    <Button
                      onClick={handleParticipar}
                      disabled={isFull}
                      className="w-full gap-2 transition-bounce"
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
                    <Badge variant="secondary">{partida.organizador.tipo.toUpperCase()}</Badge>
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
                      <Badge variant="outline">{participante.tipo.toUpperCase()}</Badge>
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
                onClick={handleOpenConviteDialog}
              >
                <UserPlus className="w-4 h-4" />
                Convidar Jogador
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Dialog de Convite */}
      <Dialog open={showConviteDialog} onOpenChange={setShowConviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convidar Jogador</DialogTitle>
            <DialogDescription>
              Selecione um jogador para convidar para a partida "{partida?.titulo}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Jogador</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite o nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de Usuários */}
            <div className="space-y-2">
              <Label>Jogadores Disponíveis</Label>
              <ScrollArea className="h-64 border rounded-lg">
                {loadingUsuarios ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Carregando jogadores...
                  </div>
                ) : filteredUsuarios.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? "Nenhum jogador encontrado" : "Não há jogadores disponíveis para convidar"}
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredUsuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        onClick={() => setSelectedUser(usuario)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-smooth
                          ${selectedUser?.id === usuario.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                          }
                        `}
                      >
                        <Avatar>
                          <AvatarFallback>
                            {usuario.nome.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{usuario.nome}</p>
                          <p className={`text-xs ${selectedUser?.id === usuario.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {usuario.email}
                          </p>
                        </div>
                        <Badge variant={selectedUser?.id === usuario.id ? "secondary" : "outline"}>
                          {usuario.tipo.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Mensagem */}
            {selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem (opcional)</Label>
                <Textarea
                  id="mensagem"
                  placeholder="Digite uma mensagem para o convite..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConviteDialog(false);
                setSelectedUser(null);
                setMensagem("");
                setSearchTerm("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviarConvite}
              disabled={!selectedUser || sendingConvite}
            >
              {sendingConvite ? "Enviando..." : "Enviar Convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
