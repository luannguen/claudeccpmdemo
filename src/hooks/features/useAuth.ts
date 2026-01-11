import { useState, useEffect } from 'react';
import { authService, type User } from '../../services/authService';



export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    // Init session from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user_session');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string) => {
        const result = await authService.login(email);

        if (result.success) {
            const user = result.data;
            setUser(user);
            localStorage.setItem('user_session', JSON.stringify(user));

            // Store critical context for Service Layer Headers
            localStorage.setItem('user_email', user.email);
            if (user.tenantId) {
                localStorage.setItem('tenant_id', user.tenantId);
            } else {
                localStorage.removeItem('tenant_id');
            }
            return true;
        }

        console.error("Login failed", result.error);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
    };

    const hasPermission = (permissionName: string): boolean => {
        if (!user) return false;
        return user.permissions.includes(permissionName);
    };

    const hasRole = (roleName: string): boolean => {
        if (!user) return false;
        return user.roles.includes(roleName);
    };

    return {
        user,
        login,
        logout,
        hasPermission,
        hasRole,
        isAuthenticated: !!user
    };
};
