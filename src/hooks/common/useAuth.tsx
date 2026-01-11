import { useState, useContext, createContext, type ReactNode } from 'react';
import type { User } from '../../services/userService';

// Extended User type for SaaS context
export interface AuthUser extends User {
    tenantId: string;
    isSuperAdmin: boolean;
    permissions: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) return false;

            const data = await response.json();
            if (data.success && data.user) {
                setUser(data.user);
                // In a real app, you'd store the token here
                // localStorage.setItem('token', data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        // localStorage.removeItem('token');
    };

    const hasPermission = (permissionName: string): boolean => {
        if (!user) return false;
        return user.permissions?.includes(permissionName) || false;
    };

    const hasRole = (roleName: string): boolean => {
        if (!user) return false;
        // Check if roles is array of strings or objects. The type AuthUser says strings usually?
        // Actually UserService.ts defines Role as string | Role object.
        // For simplicity let's assume fully populated or just check names if complex.
        // But user.roles in AuthUser is string[]? No, it's extending User.
        // Let's safe check.
        return user.roles?.some(r => typeof r === 'string' ? r === roleName : (r as any).name === roleName) || false;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermission, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
