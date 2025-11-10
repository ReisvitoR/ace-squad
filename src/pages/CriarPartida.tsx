import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select-native";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function CriarPartida() {
  const [isLoading, setIsLoading] = useState(false);
  const [tipo, setTipo] = useState<"amistosa" | "competitiva">("amistosa");
  const [categoria, setCategoria] = useState<string>("livre");
  const [publica, setPublica] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [duracao, setDuracao] = useState("0 minutos");
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

  // Calcula duração quando as datas mudam
  useEffect(() => {
    if (!dataInicio || !dataFim) {
      setDuracao('0 minutos');
      return;
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || fim <= inicio) {
      setDuracao('0 minutos');
      return;
    }
    
    const minutos = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      setDuracao(`${horas}h${mins > 0 ? ` ${mins}min` : ''}`);
    } else {
      setDuracao(`${minutos} minutos`);
    }
  }, [dataInicio, dataFim]);

  // Quando a data de início muda, ajusta a data de fim para o mesmo dia
  const handleDataInicioChange = (value: string) => {
    setDataInicio(value);
    
    if (value && !dataFim) {
      // Se não tem data fim, define uma hora depois por padrão
      const inicio = new Date(value);
      const fim = new Date(inicio.getTime() + 2 * 60 * 60 * 1000); // +2 horas
      const fimFormatted = fim.toISOString().slice(0, 16);
      setDataFim(fimFormatted);
    } else if (value && dataFim) {
      // Se já tem data fim, mantém o mesmo dia mas preserva o horário
      const inicio = new Date(value);
      const fimAtual = new Date(dataFim);
      
      const novaDataFim = new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate(),
        fimAtual.getHours(),
        fimAtual.getMinutes()
      );
      
      setDataFim(novaDataFim.toISOString().slice(0, 16));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const titulo = formData.get("titulo") as string;
    const descricao = formData.get("descricao") as string;
    const local = formData.get("local") as string;
    const max_participantes = parseInt(formData.get("max_participantes") as string);

    // Validação: data fim deve ser depois da data início
    if (new Date(dataFim) <= new Date(dataInicio)) {
      toast({
        title: "Erro de validação",
        description: "A data/hora de término deve ser posterior à data/hora de início.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Converte as datas do input datetime-local para ISO string com timezone do Brasil
    // O input retorna a data/hora local, precisamos converter para UTC mantendo o horário Brasil
    const dataInicioISO = new Date(dataInicio).toISOString();
    const dataFimISO = new Date(dataFim).toISOString();

    // Calcula duração em minutos
    const duracao_estimada = Math.round(
      (new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60)
    );

    try {
      const partidaData = {
        titulo,
        descricao,
        tipo,
        categoria: categoria as any,
        data_partida: dataInicioISO,
        data_fim: dataFimISO,
        duracao_estimada,
        local,
        max_participantes,
        publica,
      };

      console.log("Enviando partida:", partidaData);

      const partida = await api.createPartida(partidaData);

      toast({
        title: "Partida criada!",
        description: "Sua partida foi criada com sucesso.",
      });

      navigate(`/partida/${partida.id}`);
    } catch (error) {
      console.error("Erro ao criar partida:", error);
      toast({
        title: "Erro ao criar partida",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2 transition-smooth hover:gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Card className="card-gradient shadow-card animate-slide-up border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Criar Nova Partida</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Partida *</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Ex: Vôlei na Praia - Sábado"
                  required
                  className="transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Adicione detalhes sobre a partida..."
                  rows={4}
                  className="transition-smooth resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select 
                    id="tipo"
                    name="tipo"
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="transition-smooth"
                  >
                    <option value="amistosa">Amistosa</option>
                    <option value="competitiva">Competitiva</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    id="categoria"
                    name="categoria"
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)}
                    className="transition-smooth"
                  >
                    <option value="livre">Livre</option>
                    <option value="noob">Noob</option>
                    <option value="amador">Amador</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data e Hora de Início *</Label>
                  <Input
                    id="data_inicio"
                    name="data_inicio"
                    type="datetime-local"
                    value={dataInicio}
                    onChange={(e) => handleDataInicioChange(e.target.value)}
                    required
                    className="transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data e Hora de Término *</Label>
                  <Input
                    id="data_fim"
                    name="data_fim"
                    type="datetime-local"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                    min={dataInicio}
                    className="transition-smooth"
                  />
                  <p className="text-xs text-muted-foreground">
                    Duração: {duracao}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participantes">Máx. Participantes *</Label>
                <Input
                  id="max_participantes"
                  name="max_participantes"
                  type="number"
                  min="2"
                  max="50"
                  defaultValue="12"
                  required
                  className="transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Local *</Label>
                <Input
                  id="local"
                  name="local"
                  placeholder="Ex: Quadra da Praia do Leblon"
                  required
                  className="transition-smooth"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="publica" className="text-base cursor-pointer">
                    Partida Pública
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que qualquer jogador possa ver e participar
                  </p>
                </div>
                <Switch
                  id="publica"
                  checked={publica}
                  onCheckedChange={setPublica}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 transition-smooth"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 font-semibold transition-bounce"
                >
                  {isLoading ? "Criando..." : "Criar Partida"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
