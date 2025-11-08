import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryConfig = {
  livre: {
    label: "LIVRE",
    className: "bg-livre text-livre-foreground hover:bg-livre/90",
  },
  noob: {
    label: "NOOB",
    className: "bg-noob text-noob-foreground hover:bg-noob/90",
  },
  amador: {
    label: "AMADOR",
    className: "bg-amador text-amador-foreground hover:bg-amador/90",
  },
  intermediario: {
    label: "INTERMEDIÁRIO",
    className: "bg-intermediario text-intermediario-foreground hover:bg-intermediario/90",
  },
  avancado: {
    label: "AVANÇADO",
    className: "bg-avancado text-avancado-foreground hover:bg-avancado/90",
  },
};

interface CategoryBadgeProps {
  categoria: string;
  className?: string;
}

export function CategoryBadge({ categoria, className }: CategoryBadgeProps) {
  const categoriaLower = categoria.toLowerCase() as keyof typeof categoryConfig;
  const config = categoryConfig[categoriaLower] || categoryConfig.livre;

  return (
    <Badge className={cn("font-semibold transition-smooth", config.className, className)}>
      {config.label}
    </Badge>
  );
}
