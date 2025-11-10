import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import volleyballIcon from "@/assets/volleyball.png";
import logoIfpi from "@/assets/logo-ifpi.svg";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    // Validação do tamanho do nome
    if (nome.length > 25) {
      setIsLoading(false);
      return;
    }

    try {
      await register(nome, email, senha);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo with volleyball */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="relative group">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 scale-150" />
            
            {/* Main circle */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl animate-pulse-glow">
              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-background/10 backdrop-blur-sm" />
              
              {/* Icon - Removido background, ajustado tamanho e mix-blend-mode */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-3">
                <img 
                  src={volleyballIcon} 
                  alt="Volleyball" 
                  className="w-full h-full object-contain animate-spin-slow drop-shadow-2xl brightness-110 contrast-125"
                  style={{ mixBlendMode: 'lighten' }}
                />
              </div>
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-lg" />
            </div>
            <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full shadow-lg" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
              Galera do Vôlei
            </h1>
            <p className="text-muted-foreground font-medium">
              Sua plataforma de vôlei
            </p>
          </div>
        </div>

        <Card className="card-gradient shadow-2xl border-2 border-primary/10 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-bold">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Entre ou crie sua conta para começar a jogar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="transition-smooth">Login</TabsTrigger>
                <TabsTrigger value="register" className="transition-smooth">Registrar-se</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-fade-in">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="transition-smooth focus:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        name="senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        maxLength={20}
                        required
                        className="transition-smooth focus:scale-[1.02] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-semibold transition-bounce hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Entrando...
                      </span>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="animate-fade-in">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      name="nome"
                      placeholder="Seu nome"
                      maxLength={25}
                      required
                      className="transition-smooth focus:scale-[1.02]"
                      onInvalid={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (input.value.length > 25) {
                          input.setCustomValidity("Abrevie seu nome por favor");
                        }
                      }}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.setCustomValidity("");
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo de 25 caracteres
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input
                      id="email-register"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="transition-smooth focus:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha-register">Senha</Label>
                    <div className="relative">
                      <Input
                        id="senha-register"
                        name="senha"
                        type={showPasswordRegister ? "text" : "password"}
                        placeholder="••••••••"
                        maxLength={20}
                        required
                        className="transition-smooth focus:scale-[1.02] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswordRegister ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Máximo de 20 caracteres
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-semibold transition-bounce hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Criando conta...
                      </span>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Ao criar uma conta, você começa como{" "}
            <span className="font-semibold text-noob px-2 py-0.5 rounded bg-noob/10">
              NOOB
            </span>{" "}
            e pode evoluir jogando!
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-noob animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-amador animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-intermediario animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="w-2 h-2 rounded-full bg-avancado animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>

        {/* Rodapé Educacional */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
            <img 
              src={logoIfpi} 
              alt="Logo IFPI" 
              className="h-16 w-auto"
            />
            <div className="text-left text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Projeto Educacional - Programação para Internet II</p>
              <p className="text-xs">Professor Rogério Silva - IFPI Campus Teresina Central</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
