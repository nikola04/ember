import { Compass, Plus } from 'lucide-react';
import type { ServerDTO } from '@ember/protocol';
import { EmberLogo } from '../../../components/EmberLogo';
import { ProfileButton } from '../../auth/components/ProfileButton';
import { useMyServers } from '../hooks/useMyServers';

function initialOf(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function ServerTile({ server }: { server: ServerDTO }) {
    return (
        <button
            type="button"
            title={server.name}
            className="flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center rounded-[14px] bg-[#222730] text-[15px] font-medium text-[#9aa0aa] transition-all duration-200 hover:rounded-[16px] hover:bg-[#2a3340]"
        >
            {initialOf(server.name)}
        </button>
    );
}

export function ServerRail() {
    const { data: servers, isLoading } = useMyServers();

    return (
        <div className="z-30 flex h-full w-[68px] flex-none flex-col items-center gap-[9px] border-r border-line-rail bg-rail py-[14px]">
            <div
                className="flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center rounded-[14px] border border-[#2c1c1a]"
                style={{
                    background: 'linear-gradient(155deg,#161013,#0e0a0b)',
                    boxShadow: '0 0 24px -7px rgba(227,93,58,.5)',
                }}
                title="Ember"
            >
                <EmberLogo size={25} />
            </div>

            <div className="my-[3px] h-px w-[26px] bg-line-2" />

            <div className="flex flex-1 flex-col items-center gap-[9px] overflow-y-auto">
                {isLoading ? (
                    <div className="h-[46px] w-[46px] animate-pulse rounded-[14px] bg-line-2" />
                ) : (
                    servers?.map((s) => <ServerTile key={s.id} server={s} />)
                )}

                <button
                    type="button"
                    className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#2a2a32] text-mint transition-colors duration-200 hover:border-[#3a564c] hover:bg-[#101714]"
                    aria-label="Add server"
                >
                    <Plus size={22} strokeWidth={1.5} />
                </button>

                <button
                    type="button"
                    className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[14px] text-fg-hint transition-colors duration-200 hover:text-fg-dim"
                    aria-label="Explore"
                >
                    <Compass size={22} strokeWidth={1.5} />
                </button>
            </div>

            <div className="my-[3px] h-px w-[26px] bg-line-2" />

            <ProfileButton />
        </div>
    );
}
