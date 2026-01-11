import type { Result } from '../data/types';
import { ErrorCodes } from '../data/types';
import type { Role } from './rbacService';

export interface User {
    _id: string;
    email: string;
    name?: string;
    roles: Role[];
    isSuperAdmin: boolean;
    tenantId?: string;
    createdAt: string;
}

const API_URL = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const userService = {
    getUsers: async (): Promise<Result<User[]>> => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: {
                        message: error.message || 'Failed to fetch users',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    code: ErrorCodes.UNKNOWN_ERROR
                }
            };
        }
    },

    inviteUser: async (email: string, name: string, roleIds: string[]): Promise<Result<User>> => {
        try {
            const response = await fetch(`${API_URL}/users/invite`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, name, roleIds })
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: {
                        message: error.message || 'Failed to invite user',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    code: ErrorCodes.UNKNOWN_ERROR
                }
            };
        }
    },

    assignRoles: async (userId: string, roleIds: string[]): Promise<Result<User>> => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/roles`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ roleIds })
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: {
                        message: error.message || 'Failed to update roles',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    code: ErrorCodes.UNKNOWN_ERROR
                }
            };
        }
    },

    deleteUser: async (id: string): Promise<Result<boolean>> => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: {
                        message: error.message || 'Failed to delete user',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }

            return { success: true, data: true };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    code: ErrorCodes.UNKNOWN_ERROR
                }
            };
        }
    }
};
