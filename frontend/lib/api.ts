/**
 * OpenLedger Black - API Client
 * Type-safe HTTP client with JWT authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    full_name: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

class APIClient {
    private client: AxiosInstance;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                if (this.accessToken) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const tokens = await this.refreshAccessToken();
                        if (tokens && originalRequest) {
                            originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        this.logout();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                    }
                }

                return Promise.reject(error);
            }
        );

        // Load tokens from localStorage on initialization
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('access_token');
            this.refreshToken = localStorage.getItem('refresh_token');
        }
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const response = await this.client.post<AuthTokens>('/auth/login', credentials);
        this.setTokens(response.data);
        return response.data;
    }

    async register(data: RegisterData): Promise<any> {
        const response = await this.client.post('/auth/register', data);
        return response.data;
    }

    async refreshAccessToken(): Promise<AuthTokens | null> {
        if (!this.refreshToken) return null;

        try {
            const response = await this.client.post<AuthTokens>('/auth/refresh', {
                refresh_token: this.refreshToken,
            });
            this.setTokens(response.data);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async getCurrentUser(): Promise<any> {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    private setTokens(tokens: AuthTokens) {
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;

        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
        }
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;

        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }

    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    // ========================================================================
    // FINANCE
    // ========================================================================

    async getTransactions(params?: any) {
        const response = await this.client.get('/finance/transactions', { params });
        return response.data;
    }

    async createTransaction(data: any) {
        const response = await this.client.post('/finance/transactions', data);
        return response.data;
    }

    async getBudgets() {
        const response = await this.client.get('/finance/budgets');
        return response.data;
    }

    async getCashflow(params?: any) {
        const response = await this.client.get('/finance/cashflow', { params });
        return response.data;
    }

    async getFinancialAnalytics(params?: any) {
        const response = await this.client.get('/finance/analytics', { params });
        return response.data;
    }

    // ========================================================================
    // PROJECTS
    // ========================================================================

    async getProjects(params?: any) {
        const response = await this.client.get('/projects', { params });
        return response.data;
    }

    async getProject(id: number) {
        const response = await this.client.get(`/projects/${id}`);
        return response.data;
    }

    async createProject(data: any) {
        const response = await this.client.post('/projects', data);
        return response.data;
    }

    async updateProject(id: number, data: any) {
        const response = await this.client.patch(`/projects/${id}`, data);
        return response.data;
    }

    async getProjectMilestones(projectId: number) {
        const response = await this.client.get(`/projects/${projectId}/milestones`);
        return response.data;
    }

    async createMilestone(projectId: number, data: any) {
        const response = await this.client.post(`/projects/${projectId}/milestones`, data);
        return response.data;
    }

    // ========================================================================
    // ASSETS
    // ========================================================================

    async getAssets(params?: any) {
        const response = await this.client.get('/assets', { params });
        return response.data;
    }

    async createAsset(data: any) {
        const response = await this.client.post('/assets', data);
        return response.data;
    }

    async createKPI(data: any) {
        const response = await this.client.post('/impact/kpis', data);
        return response.data;
    }

    async recordKPIValue(kpiId: number, data: any) {
        const response = await this.client.post(`/impact/kpis/${kpiId}/record`, data);
        return response.data;
    }

    async getBeneficiaries(params?: any) {
        const response = await this.client.get('/impact/beneficiaries', { params });
        return response.data;
    }

    async getImpactHeatmap() {
        const response = await this.client.get('/impact/heatmap');
        return response.data;
    }
}

// Export singleton instance
export const api = new APIClient();
