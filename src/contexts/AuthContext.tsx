import React, { createContext, useContext, useState, useEffect } from "react";
import { api, User, AuthResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔐 Verificando autenticação... Token:", token ? "Presente" : "Ausente");
        
        if (token) {
          api.setToken(token);
          console.log("📡 Buscando perfil do usuário...");
          const userData = await api.getPerfil();
          console.log("✅ Usuário autenticado:", userData.nome);
          setUser(userData);
        } else {
          console.log("ℹ️ Nenhum token encontrado");
        }
      } catch (error) {
        console.error("❌ Erro ao verificar autenticação:", error);
        api.clearToken();
        localStorage.removeItem("token");
      } finally {
        console.log("✅ Verificação de autenticação concluída");
        setIsLoading(false);
      }
    };

    // Adiciona um pequeno delay para garantir que tudo está montado
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response: AuthResponse = await api.login(email, senha);
      api.setToken(response.access_token);
      setUser(response.user);
      toast({
        title: "Login realizado!",
        description: `Bem-vindo, ${response.user.nome}!`,
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (nome: string, email: string, senha: string) => {
    try {
      const response: AuthResponse = await api.register(nome, email, senha);
      api.setToken(response.access_token);
      setUser(response.user);
      toast({
        title: "Conta criada!",
        description: `Bem-vindo, ${response.user.nome}! Você começou como NOOB.`,
      });
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
