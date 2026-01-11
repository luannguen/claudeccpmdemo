import { success, failure, ErrorCodes } from '../data/types';
import type { Result } from '../data/types';

export interface User {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    tenantId?: string;
}

export const authService = {
    login: async (email: string): Promise<Result<User>> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: '123' })
            });

            if (!res.ok) {
                const err = await res.json();
                return failure(err.message, ErrorCodes.UNAUTHORIZED);
            }

            const data = await res.json();
            if (data.success) {
                return success(data.user);
            }
            return failure("Login failed", ErrorCodes.UNAUTHORIZED);
        } catch (error: any) {
            return failure(String(error), ErrorCodes.NETWORK_ERROR);
        }
    }
};
