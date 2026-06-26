import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from '@ember/protocol';
import { useCreateChannelGroup } from '../hooks/useChannelGroups';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
});
type FormValues = z.infer<typeof formSchema>;

interface CreateGroupModalProps {
    serverId: string;
    onClose: () => void;
}

export function CreateGroupModal({ serverId, onClose }: CreateGroupModalProps) {
    const mutation = useCreateChannelGroup(serverId);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '' },
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
            await mutation.mutateAsync({ name: data.name });
            onClose();
        } catch {
            setError('root', { message: 'Failed to create group. Try again.' });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="border-line-2 relative w-full max-w-[420px] rounded-[14px] border bg-[#1a1a24] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="text-fg-dim hover:bg-iconbtn hover:text-fg-primary absolute top-4 right-4 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] transition-colors"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>

                <h2 className="text-fg-primary mb-1 text-[15px] font-medium">Create Group</h2>
                <p className="text-fg-muted mb-5 text-[13px]">Groups organize channels into categories.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div>
                        <label className="text-fg-hint mb-1.5 block text-[11px] font-medium tracking-[0.08em] uppercase">
                            Group Name <span className="text-accent">*</span>
                        </label>
                        <input
                            {...register('name')}
                            autoFocus
                            placeholder="Text Channels"
                            className="border-line-2 bg-lift text-fg-primary placeholder:text-fg-hint focus:border-fg-faint w-full rounded-[9px] border px-3 py-2.5 text-[13.5px] transition-colors outline-none"
                        />
                        {errors.name && <p className="text-accent mt-1.5 text-[12px]">{errors.name.message}</p>}
                    </div>

                    {errors.root && <p className="text-accent text-[12px]">{errors.root.message}</p>}

                    <div className="mt-1 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-fg-dim hover:bg-lift hover:text-fg-primary rounded-[9px] px-4 py-2 text-[13.5px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || mutation.isPending}
                            className="bg-accent rounded-[9px] px-5 py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Creating…' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
