import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerRequestSchema, type RegisterRequest } from '@ember/protocol';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface RegisterFormProps {
    onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const { register: registerMutation, login } = useAuth();
    const {
        register: field,
        handleSubmit,
        formState: { errors },
        setError,
        getValues,
    } = useForm<RegisterRequest>({ resolver: zodResolver(registerRequestSchema) });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await registerMutation.mutateAsync(values);
            await login.mutateAsync({ email: getValues('email'), password: getValues('password') });
            onSuccess?.();
        } catch (e) {
            const message = axios.isAxiosError(e) ? (e.response?.data?.message ?? 'Registration failed') : 'Registration failed';
            setError('root', { message });
        }
    });

    const fields: { name: keyof RegisterRequest; label: string; type: string; autoComplete?: string }[] = [
        { name: 'displayName', label: 'Display Name', type: 'text', autoComplete: 'name' },
        { name: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
    ];

    return (
        <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
            {fields.map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                    <label className="text-fg-muted text-[12px] font-medium tracking-widest uppercase">{f.label}</label>
                    <input
                        type={f.type}
                        autoComplete={f.autoComplete}
                        {...field(f.name)}
                        className="border-line-2 bg-lift text-fg-primary focus:border-accent rounded-[9px] border px-3 py-[10px] text-[14px] transition-colors outline-none"
                    />
                    {errors[f.name] && <span className="text-[12px] text-red-400">{errors[f.name]?.message}</span>}
                </div>
            ))}

            {errors.root && <span className="text-[13px] text-red-400">{errors.root.message}</span>}

            <button
                type="submit"
                disabled={registerMutation.isPending || login.isPending}
                className="bg-accent rounded-[9px] px-4 py-[10px] text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {registerMutation.isPending || login.isPending ? 'Creating account…' : 'Create account'}
            </button>
        </form>
    );
}
