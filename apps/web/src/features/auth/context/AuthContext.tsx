import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { UserDTO } from '@ember/protocol';
import { useMe } from '../../users/hooks/useMe';
import { useLogin } from '../hooks/useLogin';
import { useLogout } from '../hooks/useLogout';
import { useRegister } from '../hooks/useRegister';

interface AuthContextValue {
    user: UserDTO | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: ReturnType<typeof useLogin>;
    register: ReturnType<typeof useRegister>;
    logout: ReturnType<typeof useLogout>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const me = useMe();
    const login = useLogin();
    const register = useRegister();
    const logout = useLogout();

    const value = useMemo<AuthContextValue>(
        () => ({
            user: me.data ?? null,
            isLoading: me.isLoading,
            isAuthenticated: !!me.data,
            login,
            register,
            logout,
        }),
        [me.data, me.isLoading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
