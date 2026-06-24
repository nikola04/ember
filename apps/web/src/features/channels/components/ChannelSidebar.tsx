import { ChevronDown, Hash, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ChannelDTO, ServerDetailsDTO } from '@ember/protocol';
import { ServerHeader } from '../../servers/components/ServerHeader';
import { useChannels } from '../hooks/useChannels';

interface ChannelSidebarProps {
    server: ServerDetailsDTO;
}

export function ChannelSidebar({ server }: ChannelSidebarProps) {
    const { data: channels, isLoading, error } = useChannels(server.id);

    const text = (channels ?? []).filter((c) => c.type === 'text').sort(byPosition);
    const voice = (channels ?? []).filter((c) => c.type === 'voice').sort(byPosition);

    return (
        <aside className="flex h-full w-[244px] flex-none flex-col border-r border-line-1 bg-panel">
            <ServerHeader server={server} />

            <div className="flex-1 overflow-y-auto px-[10px] pb-[10px] pt-[16px]">
                {error ? (
                    <div className="px-2 py-3 text-[12.5px] text-fg-hint">Failed to load channels.</div>
                ) : isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <>
                        <ChannelGroup label="Text Channels" channels={text} icon="text" />
                        {voice.length > 0 && (
                            <div className="mt-[14px]">
                                <ChannelGroup label="Voice Channels" channels={voice} icon="voice" />
                            </div>
                        )}
                        {text.length === 0 && voice.length === 0 && (
                            <div className="px-2 py-3 text-[12.5px] text-fg-hint">No channels yet.</div>
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}

function byPosition(a: ChannelDTO, b: ChannelDTO) {
    return a.position - b.position;
}

interface ChannelGroupProps {
    label: string;
    channels: ChannelDTO[];
    icon: 'text' | 'voice';
}

function ChannelGroup({ label, channels, icon }: ChannelGroupProps) {
    const [open, setOpen] = useState(true);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full cursor-pointer items-center gap-1 rounded px-2 py-1 text-fg-dim transition-colors hover:text-fg-soft"
            >
                <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className={`transition-transform duration-150 ${open ? 'rotate-0' : '-rotate-90'}`}
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.1em]">{label}</span>
            </button>

            {open && (
                <div className="mt-1 flex flex-col">
                    {channels.map((c) => (
                        <ChannelRow key={c.id} channel={c} icon={icon} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ChannelRowProps {
    channel: ChannelDTO;
    icon: 'text' | 'voice';
}

function ChannelRow({ channel, icon }: ChannelRowProps) {
    const Icon = icon === 'text' ? Hash : Volume2;
    return (
        <NavLink
            to={`/servers/${channel.serverId}/channels/${channel.id}`}
            className={({ isActive }) =>
                `group relative flex items-center gap-[9px] rounded-[7px] px-[10px] py-[7px] transition-colors duration-150 ${
                    isActive ? 'bg-active text-fg-primary' : 'text-fg-dim hover:bg-lift hover:text-fg-primary'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && <span className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r bg-accent" />}
                    <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={isActive ? (icon === 'voice' ? 'text-mint' : 'text-accent') : icon === 'voice' ? 'text-mint' : ''}
                    />
                    <span className={`truncate text-[14.5px] ${isActive ? 'font-medium' : ''}`}>{channel.name}</span>
                </>
            )}
        </NavLink>
    );
}

function SidebarSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            <div className="h-3 w-20 rounded bg-line-2" />
            <div className="h-6 rounded bg-line-1" />
            <div className="h-6 rounded bg-line-1" />
            <div className="h-6 rounded bg-line-1" />
        </div>
    );
}
