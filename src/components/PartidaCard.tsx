import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PartidaStatus } from "@/components/PartidaStatus";
import { Partida } from "@/lib/api";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PartidaCardProps {
  partida: Partida;
  onViewDetails: (id: number) => void;
  onParticipar?: (id: number) => void;
  canParticipate?: boolean;
}

export function PartidaCard({
  partida,
  onViewDetails,
  onParticipar,
  canParticipate = true,
}: PartidaCardProps) {
  // Calcula participantes: usa o array de participantes se existir, senão usa total_participantes
  const numParticipantes = partida.participantes?.length ?? partida.total_participantes;
  const isFull = numParticipantes >= partida.max_participantes;
  const vagasRestantes = partida.max_participantes - numParticipantes;

  return (
    <Card
      className={cn(
        "card-gradient shadow-card hover:shadow-card-hover transition-smooth cursor-pointer animate-scale-in",
        "border-2 hover:border-primary/20"
      )}
      onClick={() => onViewDetails(partida.id)}
    >
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-xl text-foreground line-clamp-1">
            {partida.titulo}
          </h3>
          <CategoryBadge categoria={partida.categoria} />
        </div>
        {partida.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {partida.descricao}
          </p>
        )}
        {/* Status da Partida */}
        <PartidaStatus status={partida.status} />
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(partida.data_partida), "dd MMM yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{partida.local}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span className="font-semibold">
            {numParticipantes}/{partida.max_participantes} participantes
          </span>
          {vagasRestantes > 0 && (
            <span className="text-muted-foreground">
              ({vagasRestantes} {vagasRestantes === 1 ? "vaga" : "vagas"})
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {onParticipar && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onParticipar(partida.id);
            }}
            disabled={!canParticipate || isFull}
            className="w-full font-semibold transition-bounce"
          >
            {isFull ? "Lotada" : "Participar"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
