import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ServerDTO } from '@ember/protocol';
import { ProfileButton } from '../../auth/components/ProfileButton';
import { useMyServers } from '../hooks/useMyServers';
import { CreateServerModal } from './CreateServerModal';

function initialOf(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function ServerTile({ server }: { server: ServerDTO }) {
    const ref = useRef<HTMLAnchorElement>(null);
    const [tooltipY, setTooltipY] = useState<number | null>(null);

    function handleMouseEnter() {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setTooltipY(rect.top + rect.height / 2);
    }

    return (
        <>
            <NavLink
                ref={ref}
                to={`/servers/${server.id}`}
                className="group relative flex-none"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setTooltipY(null)}
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <span className="absolute -left-[14px] top-1/2 h-[30px] w-[4px] -translate-y-1/2 rounded-r bg-accent" />
                        )}
                        <div
                            className={`flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[14px] text-[15px] font-medium transition-all duration-200 group-hover:rounded-[16px] text-white ${isActive ? 'bg-accent' : 'bg-[#222730] hover:bg-accent/50'}`}
                        >
                            {initialOf(server.name)}
                        </div>
                    </>
                )}
            </NavLink>

            {tooltipY !== null && (
                <div
                    className="pointer-events-none max-w-48 fixed z-50 flex items-center"
                    style={{ top: tooltipY, left: 64, transform: 'translateY(-50%)' }}
                >
                    {/* arrow */}
                    <div
                        className="h-0 w-0 flex-none"
                        style={{
                            borderTop: '5px solid transparent',
                            borderBottom: '5px solid transparent',
                            borderRight: '6px solid #1e1e2a',
                        }}
                    />
                    <div className="flex items-center gap-2 rounded-[9px] bg-[#1e1e2a] px-3 py-2 shadow-xl">
                        <span className="text-[13px] font-medium text-fg-primary">{server.name}</span>
                    </div>
                </div>
            )}
        </>
    );
}

export function ServerRail() {
    const { data: servers, isLoading } = useMyServers();
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="z-30 flex h-full w-[68px] flex-none flex-col items-center gap-[9px] border-r border-line-rail bg-rail py-[14px]">
            {/*<div
                className="flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center rounded-[14px] bg-[#222730]"
                title="Ember"
            ></div>

            <div className="my-[3px] h-px w-[26px] bg-line-2" />*/}

            <div className="flex flex-1 flex-col items-center gap-[9px] overflow-y-auto">
                {isLoading ? (
                    <div className="h-[46px] w-[46px] animate-pulse rounded-[14px] bg-line-2" />
                ) : (
                    servers?.map((s) => <ServerTile key={s.id} server={s} />)
                )}

                <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#2a2a32] text-mint transition-colors duration-200 hover:border-[#3a564c] hover:bg-[#101714]"
                    aria-label="Add server"
                >
                    <Plus size={22} strokeWidth={1.5} />
                </button>
            </div>

            <div className="my-[3px] h-px w-[26px] bg-line-2" />

            <ProfileButton />

            {createOpen && <CreateServerModal onClose={() => setCreateOpen(false)} />}
        </div>
    );
}
