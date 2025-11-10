import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PartidaCard } from "@/components/PartidaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select-native";
import { api, Partida } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [minhasPartidas, setMinhasPartidas] = useState<Partida[]>([]);
  const [participando, setParticipando] = useState<Partida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>("todas");
  const [activeTab, setActiveTab] = useState("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const partidasPorPagina = 10;
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

  // Carrega partidas quando o componente monta ou categoria muda
  useEffect(() => {
    if (isMountedRef.current) {
      loadPartidas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  const loadPartidas = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    try {
      const [todasPartidas, minhas, part] = await Promise.all([
        api.getPartidas(categoria === "todas" ? undefined : categoria),
        api.getMinhasPartidas(),
        api.getPartidasParticipando(),
      ]);
      
      if (!isMountedRef.current) return;
      
      // Combina todas as partidas para garantir que nenhuma suma da aba "Todas"
      const todasArray = Array.isArray(todasPartidas) ? todasPartidas : [];
      const minhasArray = Array.isArray(minhas) ? minhas : [];
      const partArray = Array.isArray(part) ? part : [];
      
      // Cria um Map para evitar duplicatas (usa o ID como chave)
      const partidasMap = new Map<number, Partida>();
      
      // Adiciona todas as partidas ao mapa
      [...todasArray, ...minhasArray, ...partArray].forEach(partida => {
        if (partida && partida.id) {
          partidasMap.set(partida.id, partida);
        }
      });
      
      // Converte o mapa de volta para array e filtra por categoria se necessário
      const todasPartidasCombinadas = Array.from(partidasMap.values());
      const partidasFiltradas = categoria === "todas" 
        ? todasPartidasCombinadas
        : todasPartidasCombinadas.filter(p => p.categoria === categoria);
      
      setPartidas(partidasFiltradas);
      setMinhasPartidas(minhasArray);
      setParticipando(partArray);
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("Erro ao carregar partidas:", error);
      // Define arrays vazios em caso de erro
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

  // Agrupa partidas por data
  const agruparPartidasPorData = (partidasLista: Partida[]) => {
    const grupos: { [data: string]: Partida[] } = {};
    
    partidasLista.forEach((partida) => {
      const data = format(new Date(partida.data_partida), "yyyy-MM-dd");
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(partida);
    });
    
    // Ordena as datas
    const datasOrdenadas = Object.keys(grupos).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    return datasOrdenadas.map(data => ({
      data,
      partidas: grupos[data]
    }));
  };

  // Paginação
  const partidasAgrupadas = agruparPartidasPorData(partidas);
  const totalPaginas = Math.ceil(partidasAgrupadas.length / partidasPorPagina);
  const gruposVisiveis = partidasAgrupadas.slice(
    (currentPage - 1) * partidasPorPagina,
    currentPage * partidasPorPagina
  );

  // Reset página ao mudar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [categoria, activeTab]);

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
            <div className="relative flex items-center">
              <Filter className="absolute left-3 w-4 h-4 pointer-events-none z-10" />
              <Select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)}
                className="w-[180px] pl-9 transition-smooth"
              >
                <option value="todas">Todas</option>
                <option value="livre">Livre</option>
                <option value="noob">Noob</option>
                <option value="amador">Amador</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </Select>
            </div>
            
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
              <div className="space-y-8">
                {gruposVisiveis.map((grupo) => (
                  <div key={grupo.data} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <h2 className="text-lg font-semibold px-4 py-2 rounded-lg bg-muted">
                        {format(new Date(grupo.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {grupo.partidas.map((partida) => (
                        <PartidaCard
                          key={partida.id}
                          partida={partida}
                          onViewDetails={(id) => navigate(`/partida/${id}`)}
                          onParticipar={handleParticipar}
                          canParticipate={canParticipate(partida)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                      disabled={currentPage === totalPaginas}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
