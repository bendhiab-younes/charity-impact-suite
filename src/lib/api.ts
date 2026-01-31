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

  async updateProfile(data: any) {
    return this.request<any>('/auth/me', { method: 'PUT', body: data });
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

  async deleteFamily(id: string) {
    return this.request<any>(`/families/${id}`, { method: 'DELETE' });
  }

  // Donations
  async getDonations(associationId: string, status?: string) {
    const query = status 
      ? `?associationId=${associationId}&status=${status}`
      : `?associationId=${associationId}`;
    return this.request<any[]>(`/donations${query}`);
  }

  async getMyDonations() {
    return this.request<any[]>('/donations/my-donations');
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

  // Contributions (Money IN from donors)
  async getContributions(associationId: string, status?: string) {
    const params = new URLSearchParams({ associationId });
    if (status) params.append('status', status);
    return this.request<any[]>(`/contributions?${params.toString()}`);
  }

  async getMyContributions() {
    return this.request<any[]>('/contributions/my-contributions');
  }

  async getContribution(id: string) {
    return this.request<any>(`/contributions/${id}`);
  }

  async createContribution(data: {
    associationId: string;
    amount: number;
    donorId?: string;
    donorName?: string;
    donorEmail?: string;
    type?: string;
    method?: string;
    notes?: string;
  }) {
    return this.request<any>('/contributions', { method: 'POST', body: data });
  }

  async approveContribution(id: string) {
    return this.request<any>(`/contributions/${id}/approve`, { method: 'PUT' });
  }

  async rejectContribution(id: string, reason?: string) {
    return this.request<any>(`/contributions/${id}/reject`, { method: 'PUT', body: { reason } });
  }

  async getContributionStats(associationId: string) {
    return this.request<any>(`/contributions/stats?associationId=${associationId}`);
  }

  // Dispatches (Aid OUT to beneficiaries)
  async getDispatches(associationId: string, status?: string) {
    const params = new URLSearchParams({ associationId });
    if (status) params.append('status', status);
    return this.request<any[]>(`/dispatches?${params.toString()}`);
  }

  async getDispatch(id: string) {
    return this.request<any>(`/dispatches/${id}`);
  }

  async createDispatch(data: {
    associationId: string;
    beneficiaryId: string;
    amount: number;
    familyId?: string;
    aidType?: string;
    notes?: string;
  }) {
    return this.request<any>('/dispatches', { method: 'POST', body: data });
  }

  async getDispatchStats(associationId: string) {
    return this.request<any>(`/dispatches/stats?associationId=${associationId}`);
  }

  async getEligibleBeneficiaries(associationId: string) {
    return this.request<any[]>(`/dispatches/eligible-beneficiaries?associationId=${associationId}`);
  }

  async getAssociationBudget(associationId: string) {
    return this.request<any>(`/associations/${associationId}`).then(a => ({
      budget: a.budget || 0,
      name: a.name,
    }));
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

  async deleteRule(id: string) {
    return this.request<any>(`/rules/${id}`, { method: 'DELETE' });
  }

  // Users
  async getUsers(associationId?: string) {
    const query = associationId ? `?associationId=${associationId}` : '';
    return this.request<any[]>(`/users${query}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, { method: 'DELETE' });
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, { method: 'PUT', body: data });
  }

  async createUser(data: { email: string; password: string; name: string; role?: string; associationId?: string }) {
    return this.request<any>('/users', { method: 'POST', body: data });
  }

  // Audit Logs
  async getAuditLogs(associationId?: string, limit?: number) {
    const params = new URLSearchParams();
    if (associationId) params.append('associationId', associationId);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/audit${query}`);
  }
}

export const api = new ApiClient();
