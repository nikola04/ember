import { ChevronDown, FolderPlus, Hash, Mic, Plus, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ChannelDTO, ChannelGroupDTO, ChannelType, ServerDetailsDTO } from '@ember/protocol';
import { hasPermission, Permissions, parsePermissions } from '@ember/protocol';
import { useContextMenu, type ContextMenuEntry } from '../../../components/ContextMenu';
import { ServerHeader } from '../../servers/components/ServerHeader';
import { useAuth } from '../../auth/context/AuthContext';
import { useMyMembership } from '../../servers/hooks/useMyMembership';
import { useChannels } from '../hooks/useChannels';
import { useChannelGroups } from '../hooks/useChannelGroups';
import { CreateChannelModal } from './CreateChannelModal';
import { CreateGroupModal } from './CreateGroupModal';

interface ChannelSidebarProps {
    server: ServerDetailsDTO;
}

type Modal = { type: 'channel'; channelType: ChannelType; groupId: string | null } | { type: 'group' } | null;

export function ChannelSidebar({ server }: ChannelSidebarProps) {
    const { user } = useAuth();
    const { data: membership } = useMyMembership(server.id);
    const { data: channels, isLoading, error } = useChannels(server.id);
    const { data: groups } = useChannelGroups(server.id);
    const { show } = useContextMenu();
    const [modal, setModal] = useState<Modal>(null);

    const isOwner = user?.id === server.ownerId;
    const canManage =
        isOwner || (membership ? hasPermission(parsePermissions(membership.permissions), Permissions.MANAGE_CHANNELS) : false);

    const ungrouped = (channels ?? []).filter((c) => !c.groupId).sort(byPosition);
    const ungroupedText = ungrouped.filter((c) => c.type === 'text');
    const ungroupedVoice = ungrouped.filter((c) => c.type === 'voice');
    const sortedGroups = (groups ?? []).slice().sort((a, b) => a.position - b.position);

    function sidebarContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        if (!canManage) return;
        const items: ContextMenuEntry[] = [
            {
                label: 'Create Text Channel',
                icon: <Hash size={14} strokeWidth={1.5} />,
                onClick: () => setModal({ type: 'channel', channelType: 'text', groupId: null }),
            },
            {
                label: 'Create Voice Channel',
                icon: <Volume2 size={14} strokeWidth={1.5} />,
                onClick: () => setModal({ type: 'channel', channelType: 'voice', groupId: null }),
            },
            { separator: true },
            {
                label: 'Create Group',
                icon: <FolderPlus size={14} strokeWidth={1.5} />,
                onClick: () => setModal({ type: 'group' }),
            },
        ];
        show(items, e.clientX, e.clientY);
    }

    function groupContextMenu(e: React.MouseEvent, group: ChannelGroupDTO) {
        e.preventDefault();
        e.stopPropagation();
        if (!canManage) return;
        const items: ContextMenuEntry[] = [
            {
                label: 'Create Text Channel',
                icon: <Hash size={14} strokeWidth={1.5} />,
                onClick: () => setModal({ type: 'channel', channelType: 'text', groupId: group.id }),
            },
            {
                label: 'Create Voice Channel',
                icon: <Volume2 size={14} strokeWidth={1.5} />,
                onClick: () => setModal({ type: 'channel', channelType: 'voice', groupId: group.id }),
            },
        ];
        show(items, e.clientX, e.clientY);
    }

    return (
        <>
            <aside className="border-line-1 bg-panel flex h-full w-[244px] flex-none flex-col border-r" onContextMenu={sidebarContextMenu}>
                <ServerHeader server={server} />

                <div className="flex-1 overflow-y-auto px-[10px] pt-[16px] pb-[10px]">
                    {error ? (
                        <div className="text-fg-hint px-2 py-3 text-[12.5px]">Failed to load channels.</div>
                    ) : isLoading ? (
                        <SidebarSkeleton />
                    ) : (
                        <>
                            {/* Ungrouped text channels */}
                            {ungroupedText.length > 0 && (
                                <VirtualGroup
                                    label="Text Channels"
                                    channelType="text"
                                    channels={ungroupedText}
                                    canManage={canManage}
                                    onAddChannel={() => setModal({ type: 'channel', channelType: 'text', groupId: null })}
                                />
                            )}

                            {/* Ungrouped voice channels */}
                            {ungroupedVoice.length > 0 && (
                                <VirtualGroup
                                    label="Voice Channels"
                                    channelType="voice"
                                    channels={ungroupedVoice}
                                    canManage={canManage}
                                    onAddChannel={() => setModal({ type: 'channel', channelType: 'voice', groupId: null })}
                                />
                            )}

                            {/* Named groups */}
                            {sortedGroups.map((group) => {
                                const groupChannels = (channels ?? []).filter((c) => c.groupId === group.id).sort(byPosition);
                                return (
                                    <ChannelGroup
                                        key={group.id}
                                        group={group}
                                        channels={groupChannels}
                                        canManage={canManage}
                                        onContextMenu={(e) => groupContextMenu(e, group)}
                                        onAddChannel={(type) => setModal({ type: 'channel', channelType: type, groupId: group.id })}
                                    />
                                );
                            })}

                            {ungrouped.length === 0 && sortedGroups.length === 0 && (
                                <div className="text-fg-hint px-2 py-3 text-[12.5px]">
                                    {canManage ? 'Right-click to add channels or groups.' : 'No channels yet.'}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {modal?.type === 'channel' && (
                <CreateChannelModal
                    serverId={server.id}
                    defaultType={modal.channelType}
                    defaultGroupId={modal.groupId}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === 'group' && <CreateGroupModal serverId={server.id} onClose={() => setModal(null)} />}
        </>
    );
}

function byPosition(a: ChannelDTO, b: ChannelDTO) {
    return a.position - b.position;
}

interface VirtualGroupProps {
    label: string;
    channelType: ChannelType;
    channels: ChannelDTO[];
    canManage: boolean;
    onAddChannel: () => void;
}

function VirtualGroup({ label, channelType, channels, canManage, onAddChannel }: VirtualGroupProps) {
    const [open, setOpen] = useState(true);
    const [hovered, setHovered] = useState(false);

    function handlePlusClick(e: React.MouseEvent) {
        e.stopPropagation();
        onAddChannel();
    }

    return (
        <div className="mt-[14px]">
            <div className="flex items-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-fg-dim hover:text-fg-soft flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors"
                >
                    <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className={`flex-none transition-transform duration-150 ${open ? 'rotate-0' : '-rotate-90'}`}
                    />
                    <span className="text-[11px] font-medium tracking-widest uppercase">{label}</span>
                </button>

                {canManage && (
                    <button
                        type="button"
                        onClick={handlePlusClick}
                        aria-label={`Add ${channelType} channel`}
                        className={`text-fg-dim hover:text-fg-primary mr-1 flex h-[20px] w-[20px] flex-none items-center justify-center rounded transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <Plus size={15} strokeWidth={1.5} />
                    </button>
                )}
            </div>

            {open && (
                <div className="mt-1 flex flex-col">
                    {channels.map((c) => (
                        <ChannelRow key={c.id} channel={c} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ChannelGroupProps {
    group: ChannelGroupDTO;
    channels: ChannelDTO[];
    canManage: boolean;
    onContextMenu: (e: React.MouseEvent) => void;
    onAddChannel: (type: ChannelType) => void;
}

function ChannelGroup({ group, channels, canManage, onContextMenu, onAddChannel }: ChannelGroupProps) {
    const [open, setOpen] = useState(true);
    const [hovered, setHovered] = useState(false);
    const { show } = useContextMenu();

    function handlePlusClick(e: React.MouseEvent) {
        e.stopPropagation();
        show(
            [
                {
                    label: 'Text Channel',
                    icon: <Hash size={14} strokeWidth={1.5} />,
                    onClick: () => onAddChannel('text'),
                },
                {
                    label: 'Voice Channel',
                    icon: <Mic size={14} strokeWidth={1.5} />,
                    onClick: () => onAddChannel('voice'),
                },
            ],
            e.clientX,
            e.clientY
        );
    }

    return (
        <div className="mt-[14px]" onContextMenu={onContextMenu}>
            <div className="flex items-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-fg-dim hover:text-fg-soft flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors"
                >
                    <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className={`flex-none transition-transform duration-150 ${open ? 'rotate-0' : '-rotate-90'}`}
                    />
                    <span className="text-[11px] font-medium tracking-widest uppercase">{group.name}</span>
                </button>

                {canManage && (
                    <button
                        type="button"
                        onClick={handlePlusClick}
                        aria-label="Add channel to group"
                        className={`text-fg-dim hover:text-fg-primary mr-1 flex h-[20px] w-[20px] flex-none items-center justify-center rounded transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <Plus size={15} strokeWidth={1.5} />
                    </button>
                )}
            </div>

            {open && (
                <div className="mt-1 flex flex-col">
                    {channels.map((c) => (
                        <ChannelRow key={c.id} channel={c} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ChannelRow({ channel }: { channel: ChannelDTO }) {
    const Icon = channel.type === 'text' ? Hash : Volume2;
    const isVoice = channel.type === 'voice';
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
                    {isActive && <span className="bg-accent absolute top-1/2 left-0 h-[18px] w-[3px] -translate-y-1/2 rounded-r" />}
                    <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={isActive ? (isVoice ? 'text-mint' : 'text-accent') : isVoice ? 'text-mint' : ''}
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
            <div className="bg-line-2 h-3 w-20 rounded" />
            <div className="bg-line-1 h-6 rounded" />
            <div className="bg-line-1 h-6 rounded" />
            <div className="bg-line-1 h-6 rounded" />
        </div>
    );
}
