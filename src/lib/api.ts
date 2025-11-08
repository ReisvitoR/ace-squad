const API_BASE_URL = "http://localhost:8000/api/v1";

// Types
export interface User {
  id: number;
  nome: string;
  email: string;
  nivel: "NOOB" | "AMADOR" | "INTERMEDIARIO" | "PROPLAYER";
  partidas_jogadas?: number;
  vitorias?: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Partida {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: "normal" | "iniciante" | "ranked";
  categoria: "livre" | "noob" | "amador" | "intermediario" | "avancado";
  data_partida: string;
  local: string;
  max_participantes: number;
  participantes_count: number;
  publica: boolean;
  organizador_id: number;
  organizador?: User;
  participantes?: User[];
  estou_participando?: boolean;
}

export interface Convite {
  id: number;
  partida_id: number;
  convidado_id: number;
  mensagem?: string;
  status: "pendente" | "aceito" | "recusado";
  partida?: Partida;
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

  async getMinhasPartidas(): Promise<Partida[]> {
    return this.request<Partida[]>("/partidas/minhas");
  }

  async getPartidasParticipando(): Promise<Partida[]> {
    return this.request<Partida[]>("/partidas/participando");
  }

  async getPartida(id: number): Promise<Partida> {
    return this.request<Partida>(`/partidas/${id}`);
  }

  async createPartida(data: Omit<Partida, "id" | "participantes_count" | "organizador_id" | "organizador" | "participantes" | "estou_participando">): Promise<Partida> {
    return this.request<Partida>("/partidas/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async participarPartida(id: number): Promise<void> {
    return this.request<void>(`/partidas/${id}/participar`, {
      method: "POST",
    });
  }

  async sairPartida(id: number): Promise<void> {
    return this.request<void>(`/partidas/${id}/participar`, {
      method: "DELETE",
    });
  }

  // Convites
  async getConvitesRecebidos(): Promise<Convite[]> {
    return this.request<Convite[]>("/convites/recebidos");
  }

  async aceitarConvite(id: number): Promise<void> {
    return this.request<void>(`/convites/${id}/aceitar`, {
      method: "PUT",
    });
  }

  async recusarConvite(id: number): Promise<void> {
    return this.request<void>(`/convites/${id}/recusar`, {
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
    return this.request<User>("/perfil/");
  }
}

export const api = new ApiClient();
