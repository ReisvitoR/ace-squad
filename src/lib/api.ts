// Use o proxy do Vite em desenvolvimento
const API_BASE_URL = import.meta.env.DEV 
  ? "/api/v1" 
  : "https://substantial-ebonee-galera-volei-7e40783c.koyeb.app/api/v1";

// Types
export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: "noob" | "amador" | "intermediario" | "proplayer";
  ativo: boolean;
  pontuacao_total: number;
  partidas_jogadas: number;
  vitorias: number;
  derrotas: number;
  created_at: string;
  updated_at: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Partida {
  id: number;
  titulo: string;
  descricao?: string | null;
  tipo: "normal" | "ranked";
  categoria: string;
  data_partida: string;
  data_fim?: string | null;
  duracao_estimada: number;
  local?: string | null;
  max_participantes: number;
  publica: boolean;
  status: "ativa" | "marcada" | "em_andamento" | "finalizada" | "cancelada" | "inativa";
  pontuacao_equipe_a: number;
  pontuacao_equipe_b: number;
  organizador_id: number;
  created_at: string;
  updated_at: string | null;
  organizador: User;
  participantes: User[];
  total_participantes: number;
  participantes_confirmados: number;
  todos_confirmaram: boolean;
}

export interface Convite {
  id: number;
  status: "pendente" | "aceito" | "recusado" | "expirado";
  mandante_id: number;
  convidado_id: number;
  partida_id: number;
  mensagem?: string | null;
  data_expiracao?: string | null;
  created_at: string;
  updated_at: string | null;
  mandante: User;
  convidado: User;
  partida: Partida;
}

// API Client
class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
      console.error("API Error:", response.status, error);
      
      // Se for erro 422, mostra detalhes de validação
      if (response.status === 422 && error.detail) {
        const errorMsg = Array.isArray(error.detail) 
          ? error.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
          : error.detail;
        throw new Error(errorMsg);
      }
      
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(nome: string, email: string, senha: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha }),
    });
  }

  async login(email: string, senha: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  }

  // Partidas
  async getPartidas(categoria?: string): Promise<Partida[]> {
    const query = categoria ? `?categoria=${categoria}` : "";
    return this.request<Partida[]>(`/partidas/${query}`);
  }

  async getProximasPartidas(): Promise<Partida[]> {
    return this.request<Partida[]>("/partidas/proximas");
  }

  async getPartidasPorTipo(tipo: string): Promise<Partida[]> {
    return this.request<Partida[]>(`/partidas/tipo/${tipo}`);
  }

  async getMinhasPartidas(): Promise<Partida[]> {
    return this.request<Partida[]>("/partidas/minhas");
  }

  async getPartidasParticipando(): Promise<Partida[]> {
    return this.request<Partida[]>("/partidas/participando");
  }

  async getPartida(id: number): Promise<Partida> {
    return this.request<Partida>(`/partidas/${id}`);
  }

  async createPartida(data: {
    titulo: string;
    descricao?: string;
    tipo: "normal" | "ranked";
    categoria?: string;
    data_partida: string;
    data_fim?: string;
    duracao_estimada?: number;
    local?: string;
    max_participantes?: number;
    publica?: boolean;
  }): Promise<Partida> {
    return this.request<Partida>("/partidas/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async participarPartida(id: number): Promise<Partida> {
    return this.request<Partida>(`/partidas/${id}/participar`, {
      method: "POST",
    });
  }

  async sairPartida(id: number): Promise<Partida> {
    return this.request<Partida>(`/partidas/${id}/participar`, {
      method: "DELETE",
    });
  }

  // Convites
  async getConvitesRecebidos(): Promise<Convite[]> {
    return this.request<Convite[]>("/convites/recebidos");
  }

  async aceitarConvite(id: number): Promise<Convite> {
    return this.request<Convite>(`/convites/${id}/aceitar`, {
      method: "PUT",
    });
  }

  async recusarConvite(id: number): Promise<Convite> {
    return this.request<Convite>(`/convites/${id}/recusar`, {
      method: "PUT",
    });
  }

  async enviarConvite(convidado_id: number, partida_id: number, mensagem?: string): Promise<Convite> {
    return this.request<Convite>("/convites/", {
      method: "POST",
      body: JSON.stringify({ convidado_id, partida_id, mensagem }),
    });
  }

  // Perfil
  async getPerfil(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // Usuários
  async getUsuarios(skip: number = 0, limit: number = 100): Promise<User[]> {
    return this.request<User[]>(`/usuarios/?skip=${skip}&limit=${limit}`);
  }

  async getUsuario(userId: number): Promise<User> {
    return this.request<User>(`/usuarios/${userId}`);
  }
}

export const api = new ApiClient();
