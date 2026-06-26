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
                <label className="text-fg-muted text-[12px] font-medium tracking-widest uppercase">Email</label>
                <input
                    type="email"
                    autoComplete="email"
                    {...field('email')}
                    className="border-line-2 bg-lift text-fg-primary focus:border-accent rounded-[9px] border px-3 py-[10px] text-[14px] transition-colors outline-none"
                />
                {errors.email && <span className="text-[12px] text-red-400">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-fg-muted text-[12px] font-medium tracking-widest uppercase">Password</label>
                <input
                    type="password"
                    autoComplete="current-password"
                    {...field('password')}
                    className="border-line-2 bg-lift text-fg-primary focus:border-accent rounded-[9px] border px-3 py-[10px] text-[14px] transition-colors outline-none"
                />
                {errors.password && <span className="text-[12px] text-red-400">{errors.password.message}</span>}
            </div>

            {errors.root && <span className="text-[13px] text-red-400">{errors.root.message}</span>}

            <button
                type="submit"
                disabled={login.isPending}
                className="bg-accent rounded-[9px] px-4 py-[10px] text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
        </form>
    );
}
