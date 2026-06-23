import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginRequestSchema, type LoginRequest } from '@ember/protocol';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const { login } = useAuth();
    const {
        register: field,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginRequest>({ resolver: zodResolver(loginRequestSchema) });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await login.mutateAsync(values);
            onSuccess?.();
        } catch (e) {
            const message = axios.isAxiosError(e) ? (e.response?.data?.message ?? 'Login failed') : 'Login failed';
            setError('root', { message });
        }
    });

    return (
        <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium uppercase tracking-[0.1em] text-fg-muted">Email</label>
                <input
                    type="email"
                    autoComplete="email"
                    {...field('email')}
                    className="rounded-[9px] border border-line-2 bg-lift px-3 py-[10px] text-[14px] text-fg-primary outline-none transition-colors focus:border-accent"
                />
                {errors.email && <span className="text-[12px] text-red-400">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium uppercase tracking-[0.1em] text-fg-muted">Password</label>
                <input
                    type="password"
                    autoComplete="current-password"
                    {...field('password')}
                    className="rounded-[9px] border border-line-2 bg-lift px-3 py-[10px] text-[14px] text-fg-primary outline-none transition-colors focus:border-accent"
                />
                {errors.password && <span className="text-[12px] text-red-400">{errors.password.message}</span>}
            </div>

            {errors.root && <span className="text-[13px] text-red-400">{errors.root.message}</span>}

            <button
                type="submit"
                disabled={login.isPending}
                className="rounded-[9px] bg-accent px-4 py-[10px] text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
        </form>
    );
}
