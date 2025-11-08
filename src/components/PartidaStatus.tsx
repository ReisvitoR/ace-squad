import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, PlayCircle, Trophy, XCircle, CheckCircle, Calendar } from "lucide-react";

const statusConfig = {
  ativa: {
    label: "Ativa",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
    pulseColor: "bg-green-500",
  },
  marcada: {
    label: "Marcada",
    icon: Calendar,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    pulseColor: "bg-blue-500",
  },
  em_andamento: {
    label: "Em Andamento",
    icon: PlayCircle,
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    pulseColor: "bg-orange-500",
  },
  finalizada: {
    label: "Finalizada",
    icon: Trophy,
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    pulseColor: "bg-purple-500",
  },
  cancelada: {
    label: "Cancelada",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    iconColor: "text-red-600 dark:text-red-400",
    pulseColor: "bg-red-500",
  },
  inativa: {
    label: "Inativa",
    icon: Clock,
    className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    iconColor: "text-gray-600 dark:text-gray-400",
    pulseColor: "bg-gray-500",
  },
};

interface PartidaStatusProps {
  status: keyof typeof statusConfig;
  showAnimation?: boolean;
  className?: string;
}

export function PartidaStatus({ status, showAnimation = true, className }: PartidaStatusProps) {
  const config = statusConfig[status] || statusConfig.ativa;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant="outline"
        className={cn(
          "font-semibold transition-smooth flex items-center gap-1.5 px-3 py-1",
          config.className
        )}
      >
        <div className="relative flex items-center">
          <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
          {showAnimation && (status === "em_andamento" || status === "ativa" || status === "marcada") && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                  config.pulseColor
                )}
              />
            </span>
          )}
        </div>
        <span>{config.label}</span>
      </Badge>
    </div>
  );
}
