import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import volleyballIcon from "@/assets/volleyball.png";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
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
        {/* Logo with spinning volleyball */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl animate-pulse-glow">
              <img 
                src={volleyballIcon} 
                alt="Volleyball" 
                className="w-12 h-12 animate-spin-slow"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-xl opacity-50 animate-pulse" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              VolleyMatch
            </h1>
            <p className="text-sm text-muted-foreground mt-1 animate-fade-in">
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
                <TabsTrigger value="register" className="transition-smooth">Registrar</TabsTrigger>
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
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="transition-smooth focus:scale-[1.02]"
                    />
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
                      required
                      className="transition-smooth focus:scale-[1.02]"
                    />
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
                    <Input
                      id="senha-register"
                      name="senha"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="transition-smooth focus:scale-[1.02]"
                    />
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
      </div>
    </div>
  );
}
