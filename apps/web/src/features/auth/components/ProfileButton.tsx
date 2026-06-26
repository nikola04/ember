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
                <div className="border-line-2 bg-lift absolute bottom-13.5 left-0 z-40 flex w-[180px] flex-col rounded-[10px] border p-1 shadow-xl">
                    <div className="px-3 py-2">
                        <div className="text-fg-primary text-[13.5px] font-medium">{user.displayName}</div>
                        <div className="text-fg-muted truncate text-[11.5px]">@{user.username}</div>
                    </div>
                    <div className="bg-line-2 my-1 h-px" />
                    <button
                        type="button"
                        onClick={() => logout.mutate()}
                        className="text-fg-body hover:bg-iconbtn hover:text-accent flex items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors"
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
                <span className="border-rail bg-online absolute -right-[2px] -bottom-[2px] h-[11px] w-[11px] rounded-full border-[2.5px]" />
            </button>
        </div>
    );
}
