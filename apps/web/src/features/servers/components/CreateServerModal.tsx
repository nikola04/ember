import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from '@ember/protocol';
import { useCreateServer } from '../hooks/useCreateServer';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
    description: z.string().max(1000).trim().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface CreateServerModalProps {
    onClose: () => void;
}

export function CreateServerModal({ onClose }: CreateServerModalProps) {
    const navigate = useNavigate();
    const mutation = useCreateServer();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', description: '' },
    });

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    async function onSubmit(data: FormValues) {
        try {
            const server = await mutation.mutateAsync({ name: data.name, description: data.description });
            onClose();
            navigate(`/servers/${server.id}`);
        } catch {
            setError('root', { message: 'Failed to create server. Try again.' });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="relative w-full max-w-[420px] rounded-[14px] border border-line-2 bg-[#111118] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-fg-dim transition-colors hover:bg-iconbtn hover:text-fg-primary"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>

                <h2 className="mb-1 text-[15px] font-medium text-fg-primary">Create a Server</h2>
                <p className="mb-5 text-[13px] text-fg-muted">Give your server a name to get started.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-fg-hint">
                            Server Name <span className="text-accent">*</span>
                        </label>
                        <input
                            {...register('name')}
                            autoFocus
                            placeholder="My awesome server"
                            className="w-full rounded-[9px] border border-line-2 bg-lift px-3 py-2.5 text-[13.5px] text-fg-primary placeholder:text-fg-hint outline-none transition-colors focus:border-fg-faint"
                        />
                        {errors.name && <p className="mt-1.5 text-[12px] text-accent">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-fg-hint">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder="What's this server about?"
                            className="w-full resize-none rounded-[9px] border border-line-2 bg-lift px-3 py-2.5 text-[13.5px] text-fg-primary placeholder:text-fg-hint outline-none transition-colors focus:border-fg-faint"
                        />
                        {errors.description && <p className="mt-1.5 text-[12px] text-accent">{errors.description.message}</p>}
                    </div>

                    {errors.root && <p className="text-[12px] text-accent">{errors.root.message}</p>}

                    <div className="mt-1 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-[9px] px-4 py-2 text-[13.5px] text-fg-dim transition-colors hover:bg-lift hover:text-fg-primary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || mutation.isPending}
                            className="rounded-[9px] bg-accent px-5 py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Creating…' : 'Create Server'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
