import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Mail, User, Moon, Sun, CircleDot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [convitesCount, setConvitesCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getConvitesRecebidos()
        .then((convites) => {
          const pendentes = convites.filter((c) => c.status === "pendente");
          setConvitesCount(pendentes.length);
        })
        .catch(() => {});
    }
  }, [user]);

  const nivelColors = {
    noob: "bg-noob text-noob-foreground",
    amador: "bg-amador text-amador-foreground",
    intermediario: "bg-intermediario text-intermediario-foreground",
    proplayer: "bg-avancado text-avancado-foreground",
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer transition-smooth hover:opacity-80"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-spin-slow">
            <CircleDot className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Galera do Vôlei
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-smooth"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/convites")}
                className="relative transition-bounce"
              >
                <Mail className="w-4 h-4" />
                {convitesCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-scale-in"
                  >
                    {convitesCount}
                  </Badge>
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/perfil")}
              className="gap-2 transition-smooth hover:bg-primary/10"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.nome}</span>
              <Badge className={nivelColors[user.tipo]}>{user.tipo.toUpperCase()}</Badge>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="transition-smooth hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
