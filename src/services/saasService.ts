import type { Result } from '../data/types';
import { ErrorCodes } from '../data/types';

const API_BASE_URL = '/api/saas';

export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
    shopName: string;
    shopDomain?: string;
    plan?: 'basic' | 'pro' | 'enterprise';
}

export interface RegisterResponse {
    tenant: {
        _id: string;
        name: string;
        domain: string;
        plan: string;
    };
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const saasService = {
    register: async (data: RegisterDTO): Promise<Result<RegisterResponse>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    error: {
                        message: errorData.message || 'Registration failed',
                        code: ErrorCodes.VALIDATION_ERROR // Simplifying mapping for now
                    }
                };
            }

            const result = await response.json();
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Network error',
                    code: ErrorCodes.NETWORK_ERROR
                }
            };
        }
    },

    subscribe: async (tenantId: string, plan: string): Promise<Result<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tenantId, plan }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    error: {
                        message: errorData.message || 'Subscription update failed',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }

            const result = await response.json();
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Network error',
                    code: ErrorCodes.NETWORK_ERROR
                }
            };
        }
    },

    getTenant: async (id: string): Promise<Result<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tenants/${id}`);
            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        message: 'Failed to fetch tenant',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }
            const result = await response.json();
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: 'Network error',
                    code: ErrorCodes.NETWORK_ERROR
                }
            };
        }
    }
};
