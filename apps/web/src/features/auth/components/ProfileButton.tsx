import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function initialOf(name: string) {
    return name.trim().charAt(0).toUpperCase() || '?';
}

export function ProfileButton() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="relative flex flex-col items-center">
            {open && (
                <div className="absolute bottom-[54px] left-0 z-40 flex w-[180px] flex-col rounded-[10px] border border-line-2 bg-lift p-1 shadow-xl">
                    <div className="px-3 py-2">
                        <div className="text-[13.5px] font-medium text-fg-primary">{user.displayName}</div>
                        <div className="truncate text-[11.5px] text-fg-muted">@{user.username}</div>
                    </div>
                    <div className="my-1 h-px bg-line-2" />
                    <button
                        type="button"
                        onClick={() => logout.mutate()}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] text-fg-body transition-colors hover:bg-iconbtn hover:text-accent"
                    >
                        <LogOut size={14} strokeWidth={1.5} />
                        <span>Log out</span>
                    </button>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                title={`${user.displayName} (@${user.username})`}
                className="relative flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[#57664f] text-[14px] font-medium text-[#eaf0e6] transition-all duration-200 hover:rounded-[14px]"
            >
                {initialOf(user.displayName)}
                <span className="absolute -bottom-[2px] -right-[2px] h-[11px] w-[11px] rounded-full border-[2.5px] border-rail bg-online" />
            </button>
        </div>
    );
}
