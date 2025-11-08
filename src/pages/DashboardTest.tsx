import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PartidaCard } from "@/components/PartidaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, Partida } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function DashboardTest() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [minhasPartidas, setMinhasPartidas] = useState<Partida[]>([]);
  const [participando, setParticipando] = useState<Partida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todas");
  const isMountedRef = useRef(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Carrega partidas quando o componente monta
  useEffect(() => {
    if (isMountedRef.current) {
      loadPartidas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPartidas = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    try {
      const [todasPartidas, minhas, part] = await Promise.all([
        api.getPartidas(),
        api.getMinhasPartidas(),
        api.getPartidasParticipando(),
      ]);
      
      if (!isMountedRef.current) return;
      
      setPartidas(Array.isArray(todasPartidas) ? todasPartidas : []);
      setMinhasPartidas(Array.isArray(minhas) ? minhas : []);
      setParticipando(Array.isArray(part) ? part : []);
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("Erro ao carregar partidas:", error);
      setPartidas([]);
      setMinhasPartidas([]);
      setParticipando([]);
      toast({
        title: "Erro ao carregar partidas",
        description: error instanceof Error ? error.message : "Erro ao conectar com o servidor. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
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
    
    const nivelOrder = ["noob", "amador", "intermediario", "proplayer"];
    const userNivelIndex = nivelOrder.indexOf(user.tipo.toLowerCase());
    const partidaCategoriaIndex = nivelOrder.indexOf(partida.categoria.toLowerCase());
    
    return userNivelIndex >= partidaCategoriaIndex;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Partidas Disponíveis - TESTE SEM SELECT
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
                <Button
                  onClick={() => navigate("/criar-partida")}
                  className="mt-4 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Partida
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
                <p className="text-muted-foreground">Você não está participando de nenhuma partida</p>
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
