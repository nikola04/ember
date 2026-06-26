import { Users } from 'lucide-react';
import type { ServerDetailsDTO } from '@ember/protocol';

interface ServerTopBarProps {
    server: ServerDetailsDTO;
    membersOpen: boolean;
    onToggleMembers: () => void;
}

export function ServerTopBar({ server: _server, membersOpen, onToggleMembers }: ServerTopBarProps) {
    const channelName = '';
    return (
        <header className="bg-rail border-line-rail z-10 flex h-[56px] flex-none items-center gap-[14px] border-b px-[18px]">
            <span className="text-fg-primary text-[16px] font-medium">{channelName}</span>

            <div className="ml-auto flex items-center gap-1">
                <button
                    type="button"
                    onClick={onToggleMembers}
                    title="Toggle member list"
                    className={`flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[9px] transition-colors ${
                        membersOpen ? 'bg-accent/12 text-accent' : 'text-fg-dim hover:bg-iconbtn hover:text-fg-primary'
                    }`}
                >
                    <Users size={18} strokeWidth={1.5} />
                </button>
            </div>
        </header>
    );
}
