const API_BASE_URL = 'http://localhost:3001/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getAuthToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('auth_token', result.accessToken);
    return result;
  }

  async register(data: { email: string; password: string; name: string; role?: string }) {
    const result = await this.request<{ user: any; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: data,
    });
    localStorage.setItem('auth_token', result.accessToken);
    return result;
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  // Associations
  async getAssociations() {
    return this.request<any[]>('/associations');
  }

  async getAssociation(id: string) {
    return this.request<any>(`/associations/${id}`);
  }

  async createAssociation(data: any) {
    return this.request<any>('/associations', { method: 'POST', body: data });
  }

  async updateAssociation(id: string, data: any) {
    return this.request<any>(`/associations/${id}`, { method: 'PUT', body: data });
  }

  // Beneficiaries
  async getBeneficiaries(associationId: string) {
    return this.request<any[]>(`/beneficiaries?associationId=${associationId}`);
  }

  async getBeneficiary(id: string) {
    return this.request<any>(`/beneficiaries/${id}`);
  }

  async createBeneficiary(data: any) {
    return this.request<any>('/beneficiaries', { method: 'POST', body: data });
  }

  async updateBeneficiary(id: string, data: any) {
    return this.request<any>(`/beneficiaries/${id}`, { method: 'PUT', body: data });
  }

  async updateBeneficiaryStatus(id: string, status: string) {
    return this.request<any>(`/beneficiaries/${id}/status`, { method: 'PATCH', body: { status } });
  }

  // Families
  async getFamilies(associationId: string) {
    return this.request<any[]>(`/families?associationId=${associationId}`);
  }

  async getFamily(id: string) {
    return this.request<any>(`/families/${id}`);
  }

  async createFamily(data: any) {
    return this.request<any>('/families', { method: 'POST', body: data });
  }

  async updateFamily(id: string, data: any) {
    return this.request<any>(`/families/${id}`, { method: 'PUT', body: data });
  }

  async checkFamilyCooldown(id: string, days: number = 30) {
    return this.request<{ isEligible: boolean }>(`/families/${id}/cooldown?days=${days}`);
  }

  // Donations
  async getDonations(associationId: string, status?: string) {
    const query = status 
      ? `?associationId=${associationId}&status=${status}`
      : `?associationId=${associationId}`;
    return this.request<any[]>(`/donations${query}`);
  }

  async getDonation(id: string) {
    return this.request<any>(`/donations/${id}`);
  }

  async createDonation(data: any) {
    return this.request<any>('/donations', { method: 'POST', body: data });
  }

  async approveDonation(id: string) {
    return this.request<any>(`/donations/${id}/approve`, { method: 'PATCH' });
  }

  async rejectDonation(id: string, reason?: string) {
    return this.request<any>(`/donations/${id}/reject`, { method: 'PATCH', body: { reason } });
  }

  async completeDonation(id: string) {
    return this.request<any>(`/donations/${id}/complete`, { method: 'PATCH' });
  }

  // Rules
  async getRules(associationId: string) {
    return this.request<any[]>(`/rules?associationId=${associationId}`);
  }

  async getRule(id: string) {
    return this.request<any>(`/rules/${id}`);
  }

  async createRule(data: any) {
    return this.request<any>('/rules', { method: 'POST', body: data });
  }

  async updateRule(id: string, data: any) {
    return this.request<any>(`/rules/${id}`, { method: 'PUT', body: data });
  }

  async toggleRule(id: string) {
    return this.request<any>(`/rules/${id}/toggle`, { method: 'PATCH' });
  }

  // Users
  async getUsers(associationId?: string) {
    const query = associationId ? `?associationId=${associationId}` : '';
    return this.request<any[]>(`/users${query}`);
  }
}

export const api = new ApiClient();
