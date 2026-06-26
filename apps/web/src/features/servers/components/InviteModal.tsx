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
                className="border-line-2 relative w-full max-w-[440px] rounded-[14px] border bg-[#111118] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="text-fg-dim hover:bg-iconbtn hover:text-fg-primary absolute top-4 right-4 flex h-[28px] w-[28px] items-center justify-center rounded-[8px] transition-colors"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>

                <div className="mb-5">
                    <h2 className="text-fg-primary text-[15px] font-medium">Invite people to {server.name}</h2>
                    <p className="text-fg-muted mt-1 text-[13px]">Share this link to grant access to your server.</p>
                </div>

                {isError ? (
                    <div className="bg-lift text-fg-dim rounded-[9px] p-3 text-[13px]">Failed to generate invite. Try again.</div>
                ) : (
                    <div className="flex gap-2">
                        <div className="border-line-3 relative flex flex-1 items-center rounded-[9px] border">
                            <Link2 size={14} strokeWidth={1.5} className="text-fg-hint absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                ref={inputRef}
                                readOnly
                                value={isPending ? 'Generating…' : inviteUrl}
                                onClick={() => inputRef.current?.select()}
                                className="bg-lift text-fg-body selection:bg-accent/30 focus:border-line-2 w-full rounded-[9px] py-[9px] pr-3 pl-10 text-[13.5px] outline-none"
                            />
                            <button
                                type="button"
                                disabled={!inviteUrl || copied}
                                onClick={handleCopy}
                                className="hover:text-accent flex cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-4 text-[13.5px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-fg-hint mt-3 text-[11.5px]">Anyone with this link can join your server.</p>
            </div>
        </div>
    );
}
