import { Check, Copy, Link2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ServerDetailsDTO } from '@ember/protocol';
import { useCreateInvite } from '../hooks/useCreateInvite';

interface InviteModalProps {
    server: ServerDetailsDTO;
    onClose: () => void;
}

export function InviteModal({ server, onClose }: InviteModalProps) {
    const { mutate, data, isPending, isError } = useCreateInvite();
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const inviteUrl = data ? `${window.location.origin}/invite/${data.code}` : '';

    useEffect(() => {
        mutate(server.id);
    }, [mutate, server.id]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => {
        if (inviteUrl && inputRef.current) {
            inputRef.current.select();
        }
    }, [inviteUrl]);

    async function handleCopy() {
        if (!inviteUrl) return;
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="relative w-full max-w-[440px] rounded-[14px] border border-line-2 bg-[#111118] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-fg-dim transition-colors hover:bg-iconbtn hover:text-fg-primary"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>

                <div className="mb-5">
                    <h2 className="text-[15px] font-medium text-fg-primary">Invite people to {server.name}</h2>
                    <p className="mt-1 text-[13px] text-fg-muted">Share this link to grant access to your server.</p>
                </div>

                {isError ? (
                    <div className="rounded-[9px] bg-lift p-3 text-[13px] text-fg-dim">Failed to generate invite. Try again.</div>
                ) : (
                    <div className="flex gap-2">
                        <div className="relative rounded-[9px] flex-1 flex items-center border border-line-3">
                            <Link2 size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-hint" />
                            <input
                                ref={inputRef}
                                readOnly
                                value={isPending ? 'Generating…' : inviteUrl}
                                onClick={() => inputRef.current?.select()}
                                className="w-full rounded-[9px] bg-lift py-[9px] pl-10 pr-3 text-[13.5px] text-fg-body outline-none selection:bg-accent/30 focus:border-line-2"
                            />
                            <button
                                type="button"
                                disabled={!inviteUrl || copied}
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-1.5 rounded-[9px] px-4 text-[13.5px] font-medium text-white hover:text-accent cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>
                )}

                <p className="mt-3 text-[11.5px] text-fg-hint">Anyone with this link can join your server.</p>
            </div>
        </div>
    );
}
