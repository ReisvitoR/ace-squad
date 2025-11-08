import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function CriarPartida() {
  const [isLoading, setIsLoading] = useState(false);
  const [tipo, setTipo] = useState<"normal" | "iniciante" | "ranked">("normal");
  const [categoria, setCategoria] = useState<string>("livre");
  const [publica, setPublica] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const titulo = formData.get("titulo") as string;
    const descricao = formData.get("descricao") as string;
    const data_partida = formData.get("data_partida") as string;
    const local = formData.get("local") as string;
    const max_participantes = parseInt(formData.get("max_participantes") as string);

    try {
      const partida = await api.createPartida({
        titulo,
        descricao,
        tipo,
        categoria: categoria as any,
        data_partida,
        local,
        max_participantes,
        publica,
      });

      toast({
        title: "Partida criada!",
        description: "Sua partida foi criada com sucesso.",
      });

      navigate(`/partida/${partida.id}`);
    } catch (error) {
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
                  <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                    <SelectTrigger className="transition-smooth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="ranked">Ranked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger className="transition-smooth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="livre">Livre</SelectItem>
                      <SelectItem value="noob">Noob</SelectItem>
                      <SelectItem value="amador">Amador</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_partida">Data e Hora *</Label>
                  <Input
                    id="data_partida"
                    name="data_partida"
                    type="datetime-local"
                    required
                    className="transition-smooth"
                  />
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
