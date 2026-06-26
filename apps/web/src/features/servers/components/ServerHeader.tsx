import { ChevronDown, LogOut, Settings, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ServerDetailsDTO } from '@ember/protocol';
import { useAuth } from '../../auth/context/AuthContext';
import { InviteModal } from './InviteModal';
import { ServerSettingsModal } from './ServerSettingsModal';

interface ServerHeaderProps {
    server: ServerDetailsDTO;
}

type Modal = 'invite' | 'settings' | null;

export function ServerHeader({ server }: ServerHeaderProps) {
    const { user } = useAuth();
    const isOwner = user?.id === server.ownerId;
    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState<Modal>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    function openModal(m: Modal) {
        setOpen(false);
        setModal(m);
    }

    return (
        <>
            <div ref={wrapperRef} className="relative flex-none">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="border-line-1 text-fg-primary hover:bg-main flex h-[56px] w-full cursor-pointer items-center justify-between border-b px-[18px] transition-colors duration-150"
                >
                    <span className="truncate text-[15.5px] font-medium">{server.name}</span>
                    <ChevronDown
                        size={18}
                        strokeWidth={1.5}
                        className={`text-fg-muted flex-none transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                    />
                </button>

                {open && (
                    <div className="border-line-2 bg-lift absolute top-[54px] right-2 left-2 z-40 flex flex-col rounded-[10px] border p-1 shadow-xl">
                        <DropdownItem
                            icon={<UserPlus size={14} strokeWidth={1.5} />}
                            label="Invite People"
                            accent
                            onClick={() => openModal('invite')}
                        />
                        <DropdownItem
                            icon={<Settings size={14} strokeWidth={1.5} />}
                            label="Server Settings"
                            onClick={() => openModal('settings')}
                        />
                        {!isOwner && (
                            <>
                                <div className="bg-line-2 my-1 h-px" />
                                <DropdownItem
                                    icon={<LogOut size={14} strokeWidth={1.5} />}
                                    label="Leave Server"
                                    danger
                                    onClick={() => setOpen(false)}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            {modal === 'invite' && <InviteModal server={server} onClose={() => setModal(null)} />}
            {modal === 'settings' && <ServerSettingsModal server={server} onClose={() => setModal(null)} />}
        </>
    );
}

interface DropdownItemProps {
    icon: React.ReactNode;
    label: string;
    accent?: boolean;
    danger?: boolean;
    onClick: () => void;
}

function DropdownItem({ icon, label, accent, danger, onClick }: DropdownItemProps) {
    const color = danger
        ? 'text-[#d6634a] hover:text-[#e35d3a]'
        : accent
          ? 'text-fg-body hover:text-accent'
          : 'text-fg-body hover:text-fg-primary';
    return (
        <button
            type="button"
            onClick={onClick}
            className={`hover:bg-iconbtn flex items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors ${color}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
