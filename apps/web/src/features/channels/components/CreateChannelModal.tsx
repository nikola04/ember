import { Hash, Volume2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from '@ember/protocol';
import type { ChannelType } from '@ember/protocol';
import { useCreateChannel } from '../hooks/useCreateChannel';

const formSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name too long')
        .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, numbers, - and _ allowed'),
    type: z.enum(['text', 'voice']),
});
type FormValues = z.infer<typeof formSchema>;

interface CreateChannelModalProps {
    serverId: string;
    defaultType: ChannelType;
    defaultGroupId?: string | null;
    onClose: () => void;
}

export function CreateChannelModal({ serverId, defaultType, defaultGroupId = null, onClose }: CreateChannelModalProps) {
    const navigate = useNavigate();
    const mutation = useCreateChannel(serverId);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', type: defaultType },
    });

    const selectedType = watch('type');

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    async function onSubmit(data: FormValues) {
        try {
            const payload =
                data.type === 'text'
                    ? ({ type: 'text', name: data.name, groupId: defaultGroupId } as const)
                    : ({ type: 'voice', name: data.name, groupId: defaultGroupId } as const);
            const channel = await mutation.mutateAsync(payload);
            onClose();
            navigate(`/servers/${serverId}/channels/${channel.id}`);
        } catch {
            setError('root', { message: 'Failed to create channel. Try again.' });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="border-line-2 relative w-full max-w-[440px] rounded-[14px] border bg-[#1a1a24] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="text-fg-dim hover:bg-iconbtn hover:text-fg-primary absolute top-4 right-4 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] transition-colors"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>

                <h2 className="text-fg-primary mb-1 text-[15px] font-medium">Create Channel</h2>
                <p className="text-fg-muted mb-5 text-[13px]">Choose a channel type and give it a name.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Type selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-fg-hint text-[11px] font-medium tracking-[0.08em] uppercase">Channel Type</label>
                        <div className="flex gap-2">
                            <TypeButton
                                icon={<Hash size={18} strokeWidth={1.5} />}
                                label="Text"
                                description="Send messages and files"
                                active={selectedType === 'text'}
                                onClick={() => setValue('type', 'text')}
                            />
                            <TypeButton
                                icon={<Volume2 size={18} strokeWidth={1.5} />}
                                label="Voice"
                                description="Talk with voice and video"
                                active={selectedType === 'voice'}
                                onClick={() => setValue('type', 'voice')}
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-fg-hint mb-1.5 block text-[11px] font-medium tracking-[0.08em] uppercase">
                            Channel Name <span className="text-accent">*</span>
                        </label>
                        <div className="border-line-2 bg-lift focus-within:border-fg-faint flex items-center overflow-hidden rounded-[9px] border">
                            {selectedType === 'text' ? (
                                <Hash size={15} strokeWidth={1.5} className="text-fg-hint ml-3 flex-none" />
                            ) : (
                                <Volume2 size={15} strokeWidth={1.5} className="text-fg-hint ml-3 flex-none" />
                            )}
                            <input
                                {...register('name')}
                                autoFocus
                                placeholder={selectedType === 'text' ? 'new-channel' : 'General Voice'}
                                className="text-fg-primary placeholder:text-fg-hint w-full bg-transparent px-2 py-2.5 text-[13.5px] outline-none"
                            />
                        </div>
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
                            {mutation.isPending ? 'Creating…' : 'Create Channel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface TypeButtonProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    active: boolean;
    onClick: () => void;
}

function TypeButton({ icon, label, description, active, onClick }: TypeButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-1 items-center gap-3 rounded-[10px] border px-3 py-3 text-left transition-colors ${
                active
                    ? 'border-accent bg-accent/10 text-fg-primary'
                    : 'border-line-2 bg-lift text-fg-dim hover:border-line-3 hover:text-fg-primary'
            }`}
        >
            <span className={active ? 'text-accent' : 'text-fg-hint'}>{icon}</span>
            <div>
                <div className="text-[13px] font-medium">{label}</div>
                <div className="text-fg-hint text-[11.5px]">{description}</div>
            </div>
        </button>
    );
}
