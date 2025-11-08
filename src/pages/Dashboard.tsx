import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PartidaCard } from "@/components/PartidaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Partida } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter } from "lucide-react";

export default function Dashboard() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [minhasPartidas, setMinhasPartidas] = useState<Partida[]>([]);
  const [participando, setParticipando] = useState<Partida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>("todas");
  const [activeTab, setActiveTab] = useState("todas");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadPartidas();
  }, [user, navigate, categoria]);

  const loadPartidas = async () => {
    setIsLoading(true);
    try {
      const [todasPartidas, minhas, part] = await Promise.all([
        api.getPartidas(categoria === "todas" ? undefined : categoria),
        api.getMinhasPartidas(),
        api.getPartidasParticipando(),
      ]);
      setPartidas(todasPartidas);
      setMinhasPartidas(minhas);
      setParticipando(part);
    } catch (error) {
      toast({
        title: "Erro ao carregar partidas",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipar = async (id: number) => {
    try {
      await api.participarPartida(id);
      toast({
        title: "Sucesso!",
        description: "Você entrou na partida!",
      });
      loadPartidas();
    } catch (error) {
      toast({
        title: "Erro ao participar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const canParticipate = (partida: Partida) => {
    if (!user) return false;
    if (partida.categoria === "livre") return true;
    
    const nivelOrder = ["noob", "amador", "intermediario", "avancado"];
    const userNivelIndex = nivelOrder.indexOf(user.nivel.toLowerCase());
    const partidaCategoriaIndex = nivelOrder.indexOf(partida.categoria);
    
    return userNivelIndex >= partidaCategoriaIndex;
  };

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
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[180px] transition-smooth">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="livre">Livre</SelectItem>
                <SelectItem value="noob">Noob</SelectItem>
                <SelectItem value="amador">Amador</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => navigate("/criar-partida")}
              className="gap-2 font-semibold transition-bounce"
            >
              <Plus className="w-4 h-4" />
              Nova Partida
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 mb-8">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="minhas">Minhas Partidas</TabsTrigger>
            <TabsTrigger value="participando">Participando</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : partidas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma partida encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partidas.map((partida) => (
                  <PartidaCard
                    key={partida.id}
                    partida={partida}
                    onViewDetails={(id) => navigate(`/partida/${id}`)}
                    onParticipar={handleParticipar}
                    canParticipate={canParticipate(partida)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="minhas" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : minhasPartidas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Você ainda não criou nenhuma partida</p>
                <Button onClick={() => navigate("/criar-partida")} className="mt-4">
                  Criar minha primeira partida
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {minhasPartidas.map((partida) => (
                  <PartidaCard
                    key={partida.id}
                    partida={partida}
                    onViewDetails={(id) => navigate(`/partida/${id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="participando" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : participando.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Você ainda não está participando de nenhuma partida</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participando.map((partida) => (
                  <PartidaCard
                    key={partida.id}
                    partida={partida}
                    onViewDetails={(id) => navigate(`/partida/${id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
