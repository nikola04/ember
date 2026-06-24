import { AlertTriangle, Link2, Shield, Trash2, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InviteDTO, RoleDTO, ServerDetailsDTO } from '@ember/protocol';
import { useAuth } from '../../auth/context/AuthContext';
import { useDeleteServer } from '../hooks/useDeleteServer';
import { useInvites, useDeleteInvite } from '../hooks/useInvites';
import { useRoles } from '../hooks/useRoles';

interface ServerSettingsModalProps {
    server: ServerDetailsDTO;
    onClose: () => void;
}

type Tab = 'profile' | 'invites' | 'roles' | 'delete';

const TABS: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Server Profile' },
    { id: 'invites', label: 'Invites' },
    { id: 'roles', label: 'Roles' },
];

export function ServerSettingsModal({ server, onClose }: ServerSettingsModalProps) {
    const { user } = useAuth();
    const isOwner = user?.id === server.ownerId;
    const [tab, setTab] = useState<Tab>('profile');

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex bg-[#0e0e14]">
            {/* Left nav */}
            <div className="flex w-[220px] flex-none flex-col border-r border-line-1 px-3 py-8">
                <div className="mb-4 px-3 text-[11px] font-medium uppercase tracking-[0.1em] text-fg-hint">{server.name}</div>
                <nav className="flex flex-1 flex-col gap-0.5">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`rounded-[7px] px-3 py-[7px] text-left text-[13.5px] transition-colors ${
                                tab === t.id ? 'bg-active font-medium text-fg-primary' : 'text-fg-dim hover:bg-lift hover:text-fg-primary'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                    {isOwner && (
                        <>
                            <div className="my-2 h-px bg-line-1" />
                            <button
                                type="button"
                                onClick={() => setTab('delete')}
                                className={`rounded-[7px] px-3 py-[7px] text-left text-[13.5px] transition-colors ${
                                    tab === 'delete'
                                        ? 'bg-[#2a1515] font-medium text-[#e35d3a]'
                                        : 'text-[#c06050] hover:bg-[#1e1212] hover:text-[#e35d3a]'
                                }`}
                            >
                                Delete Server
                            </button>
                        </>
                    )}
                </nav>
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                <div className="mx-auto w-full max-w-[680px] px-10 py-10">
                    {tab === 'profile' && <ProfileTab server={server} />}
                    {tab === 'invites' && <InvitesTab serverId={server.id} />}
                    {tab === 'roles' && <RolesTab serverId={server.id} />}
                    {tab === 'delete' && <DeleteTab server={server} onDeleted={onClose} />}
                </div>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="absolute right-6 top-6 flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-fg-dim transition-colors hover:bg-iconbtn hover:text-fg-primary"
                aria-label="Close settings"
            >
                <X size={18} strokeWidth={1.5} />
            </button>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="mb-5 text-[18px] font-medium text-fg-primary">{children}</h2>;
}

function Field({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="mb-4">
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-hint">{label}</div>
            <div className="rounded-[9px] border border-line-2 bg-lift px-3 py-2.5 text-[13.5px] text-fg-body">
                {value ?? <span className="text-fg-hint italic">Not set</span>}
            </div>
        </div>
    );
}

function formatDate(iso: string) {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
}

function ProfileTab({ server }: { server: ServerDetailsDTO }) {
    return (
        <div>
            <SectionTitle>Server Profile</SectionTitle>
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[16px] bg-[#222730] text-[22px] font-medium text-[#9aa0aa]">
                    {server.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <div className="text-[16px] font-medium text-fg-primary">{server.name}</div>
                    <div className="mt-0.5 text-[12px] text-fg-hint">ID: {server.id}</div>
                </div>
            </div>
            <Field label="Name" value={server.name} />
            <Field label="Description" value={server.description} />
            <Field label="Created" value={formatDate(server.createdAt)} />
        </div>
    );
}

function InvitesTab({ serverId }: { serverId: string }) {
    const { data: invites, isLoading } = useInvites(serverId);
    const deleteMutation = useDeleteInvite(serverId);

    return (
        <div>
            <SectionTitle>Invites</SectionTitle>
            {isLoading ? (
                <div className="text-[13px] text-fg-hint">Loading…</div>
            ) : !invites?.length ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Link2 size={28} strokeWidth={1.5} className="text-fg-hint" />
                    <div className="text-[14px] text-fg-muted">No active invites</div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {invites.map((inv) => (
                        <InviteRow
                            key={inv.code}
                            invite={inv}
                            onDelete={() => deleteMutation.mutate(inv.code)}
                            deleting={deleteMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function InviteRow({ invite, onDelete, deleting }: { invite: InviteDTO; onDelete: () => void; deleting: boolean }) {
    const url = `${window.location.origin}/invite/${invite.code}`;
    return (
        <div className="flex items-center gap-3 rounded-[10px] border border-line-2 bg-lift px-4 py-3">
            <Link2 size={14} strokeWidth={1.5} className="flex-none text-fg-hint" />
            <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg-body">{url}</div>
                <div className="text-[11.5px] text-fg-hint">Code: {invite.code}</div>
            </div>
            <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex h-[28px] w-[28px] flex-none items-center justify-center rounded-[7px] text-fg-hint transition-colors hover:bg-iconbtn hover:text-[#d6634a] disabled:opacity-40"
            >
                <Trash2 size={14} strokeWidth={1.5} />
            </button>
        </div>
    );
}

function RolesTab({ serverId }: { serverId: string }) {
    const { data: roles, isLoading } = useRoles(serverId);
    const sorted = (roles ?? []).slice().sort((a, b) => b.position - a.position);

    return (
        <div>
            <SectionTitle>Roles</SectionTitle>
            {isLoading ? (
                <div className="text-[13px] text-fg-hint">Loading…</div>
            ) : !sorted.length ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Shield size={28} strokeWidth={1.5} className="text-fg-hint" />
                    <div className="text-[14px] text-fg-muted">No roles yet</div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {sorted.map((role) => (
                        <RoleRow key={role.id} role={role} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DeleteTab({ server, onDeleted }: { server: ServerDetailsDTO; onDeleted: () => void }) {
    const navigate = useNavigate();
    const deleteMutation = useDeleteServer();
    const [confirmed, setConfirmed] = useState(false);

    async function handleDelete() {
        await deleteMutation.mutateAsync(server.id);
        onDeleted();
        navigate('/');
    }

    return (
        <div>
            <SectionTitle>Delete Server</SectionTitle>
            <div className="rounded-[10px] border border-[#3a1c1c] bg-[#1a0f0f] p-5">
                <div className="mb-3 flex items-center gap-2 text-[#e35d3a]">
                    <AlertTriangle size={16} strokeWidth={1.5} />
                    <span className="text-[13.5px] font-medium">This action cannot be undone</span>
                </div>
                <p className="mb-5 text-[13px] text-fg-muted">
                    Permanently deletes <span className="font-medium text-fg-primary">{server.name}</span> and all its channels, messages,
                    and data. All members will lose access immediately.
                </p>
                <label className="mb-5 flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="mt-0.5 accent-accent"
                    />
                    <span className="text-[13px] text-fg-dim">I understand this will permanently delete the server and all its data.</span>
                </label>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!confirmed || deleteMutation.isPending}
                    className="rounded-[9px] bg-[#c0392b] px-5 py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {deleteMutation.isPending ? 'Deleting…' : 'Delete Server'}
                </button>
            </div>
        </div>
    );
}

function colorHex(n: number | null) {
    if (!n) return null;
    return `#${n.toString(16).padStart(6, '0')}`;
}

function RoleRow({ role }: { role: RoleDTO }) {
    const hex = colorHex(role.color);
    return (
        <div className="flex items-center gap-3 rounded-[10px] border border-line-2 bg-lift px-4 py-3">
            <div className="h-[14px] w-[14px] flex-none rounded-full border border-line-3" style={{ backgroundColor: hex ?? '#6a6a74' }} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-medium text-fg-primary">{role.name}</span>
                    {role.isDefault && (
                        <span className="rounded px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-fg-hint ring-1 ring-line-2">
                            default
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-fg-hint">
                <User size={12} strokeWidth={1.5} />
                <span>pos {role.position}</span>
            </div>
        </div>
    );
}
