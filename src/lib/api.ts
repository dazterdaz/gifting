// Configuración de la API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-dominio.com/api' 
  : 'http://localhost:3001/api';

// Cliente HTTP personalizado
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Servicios específicos
export const authService = {
  login: (credentials: { usernameOrEmail: string; password: string }) =>
    apiClient.post<{ user: any; token: string }>('/auth/login', credentials),
  
  logout: () => apiClient.post('/auth/logout'),
};

export const giftcardService = {
  getAll: () => apiClient.get<any[]>('/giftcards'),
  
  getById: (id: string) => apiClient.get<any>(`/giftcards/${id}`),
  
  create: (data: any) => apiClient.post<any>('/giftcards', data),
  
  update: (id: string, data: any) => apiClient.put<any>(`/giftcards/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/giftcards/${id}`),
  
  getPublic: (number: string) => apiClient.get<any>(`/giftcards/public/${number}`),
  
  updateStatus: (id: string, status: string, notes?: string, artist?: string) =>
    apiClient.put(`/giftcards/${id}/status`, { status, notes, artist }),
  
  extendExpiry: (id: string, days: number) =>
    apiClient.put(`/giftcards/${id}/extend-expiry`, { days }),
  
  acceptTerms: (number: string) =>
    apiClient.post(`/giftcards/${number}/accept-terms`),
};

export const userService = {
  getAll: () => apiClient.get<any[]>('/users'),
  
  getById: (id: string) => apiClient.get<any>(`/users/${id}`),
  
  create: (data: any) => apiClient.post<any>('/users', data),
  
  update: (id: string, data: any) => apiClient.put<any>(`/users/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export const activityService = {
  getAll: () => apiClient.get<any[]>('/activities'),
  
  getRecent: (limit?: number) => 
    apiClient.get<any[]>(`/activities/recent${limit ? `?limit=${limit}` : ''}`),
  
  create: (data: any) => apiClient.post<any>('/activities', data),
  
  getByTarget: (type: string, id: string) =>
    apiClient.get<any[]>(`/activities/target/${type}/${id}`),
};

export const contactService = {
  getAll: () => apiClient.get<any[]>('/contact-messages'),
  
  create: (data: any) => apiClient.post<any>('/contact-messages', data),
  
  updateStatus: (id: string, status: string) =>
    apiClient.put(`/contact-messages/${id}/status`, { status }),
  
  archive: (id: string) => apiClient.put(`/contact-messages/${id}/archive`),
};

export const settingsService = {
  get: () => apiClient.get<any>('/settings'),
  
  getPublic: () => apiClient.get<any>('/settings/public'),
  
  update: (data: any) => apiClient.put<any>('/settings', data),
};