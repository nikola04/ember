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
            {/* Inner layout: centered, max-width, nav + content side by side */}
            <div className="mx-auto flex w-full max-w-[940px] min-w-0">
                {/* Nav sidebar — fixed 220px, right-aligned within its column */}
                <div className="flex w-[236px] flex-none justify-end py-[60px] pr-[16px]">
                    <nav className="w-[200px]">
                        <div className="text-fg-hint mb-1 px-3 text-[11px] font-semibold tracking-[0.08em] uppercase">{server.name}</div>

                        <NavItem id="profile" current={tab} label="Server Profile" onClick={setTab} />
                        <NavItem id="invites" current={tab} label="Invites" onClick={setTab} />
                        <NavItem id="roles" current={tab} label="Roles" onClick={setTab} />

                        {isOwner && (
                            <>
                                <div className="bg-line-1 mx-3 my-2 h-px" />
                                <NavItem id="delete" current={tab} label="Delete Server" onClick={setTab} danger />
                            </>
                        )}
                    </nav>
                </div>

                {/* Divider */}
                <div className="bg-line-1 w-px flex-none self-stretch" />

                {/* Content */}
                <div className="min-w-0 flex-1 overflow-y-auto px-[40px] py-[60px]">
                    {tab === 'profile' && <ProfileTab server={server} />}
                    {tab === 'invites' && <InvitesTab serverId={server.id} />}
                    {tab === 'roles' && <RolesTab serverId={server.id} />}
                    {tab === 'delete' && <DeleteTab server={server} onDeleted={onClose} />}
                </div>
            </div>

            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-8 right-8 flex flex-col items-center gap-1"
                aria-label="Close settings"
            >
                <div className="border-line-2 text-fg-dim hover:border-fg-faint hover:text-fg-primary flex h-[36px] w-[36px] items-center justify-center rounded-full border transition-colors">
                    <X size={18} strokeWidth={1.5} />
                </div>
                <span className="text-fg-hint text-[10px] font-medium tracking-wider uppercase">ESC</span>
            </button>
        </div>
    );
}

interface NavItemProps {
    id: Tab;
    current: Tab;
    label: string;
    danger?: boolean;
    onClick: (id: Tab) => void;
}

function NavItem({ id, current, label, danger, onClick }: NavItemProps) {
    const isActive = id === current;

    const classes = danger
        ? isActive
            ? 'bg-[#2a1515] font-medium text-[#e35d3a]'
            : 'text-[#c06050] hover:bg-[#1e1212] hover:text-[#e35d3a]'
        : isActive
          ? 'bg-active font-medium text-fg-primary'
          : 'text-fg-dim hover:bg-lift hover:text-fg-primary';

    return (
        <button
            type="button"
            onClick={() => onClick(id)}
            className={`w-full rounded-[7px] px-3 py-[7px] text-left text-[13.5px] transition-colors ${classes}`}
        >
            {label}
        </button>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-fg-primary mb-5 text-[18px] font-medium">{children}</h2>;
}

function Field({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="mb-4">
            <div className="text-fg-hint mb-1.5 text-[11px] font-medium tracking-[0.08em] uppercase">{label}</div>
            <div className="border-line-2 bg-lift text-fg-body rounded-[9px] border px-3 py-2.5 text-[13.5px]">
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
                    <div className="text-fg-primary text-[16px] font-medium">{server.name}</div>
                    <div className="text-fg-hint mt-0.5 text-[12px]">ID: {server.id}</div>
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
                <div className="text-fg-hint text-[13px]">Loading…</div>
            ) : !invites?.length ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Link2 size={28} strokeWidth={1.5} className="text-fg-hint" />
                    <div className="text-fg-muted text-[14px]">No active invites</div>
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
        <div className="border-line-2 bg-lift flex items-center gap-3 rounded-[10px] border px-4 py-3">
            <Link2 size={14} strokeWidth={1.5} className="text-fg-hint flex-none" />
            <div className="min-w-0 flex-1">
                <div className="text-fg-body truncate text-[13px] font-medium">{url}</div>
                <div className="text-fg-hint text-[11.5px]">Code: {invite.code}</div>
            </div>
            <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="text-fg-hint hover:bg-iconbtn flex h-[28px] w-[28px] flex-none items-center justify-center rounded-[7px] transition-colors hover:text-[#d6634a] disabled:opacity-40"
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
                <div className="text-fg-hint text-[13px]">Loading…</div>
            ) : !sorted.length ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Shield size={28} strokeWidth={1.5} className="text-fg-hint" />
                    <div className="text-fg-muted text-[14px]">No roles yet</div>
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
                <p className="text-fg-muted mb-5 text-[13px]">
                    Permanently deletes <span className="text-fg-primary font-medium">{server.name}</span> and all its channels, messages,
                    and data. All members will lose access immediately.
                </p>
                <label className="mb-5 flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="accent-accent mt-0.5"
                    />
                    <span className="text-fg-dim text-[13px]">I understand this will permanently delete the server and all its data.</span>
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
        <div className="border-line-2 bg-lift flex items-center gap-3 rounded-[10px] border px-4 py-3">
            <div className="border-line-3 h-[14px] w-[14px] flex-none rounded-full border" style={{ backgroundColor: hex ?? '#6a6a74' }} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-fg-primary text-[13.5px] font-medium">{role.name}</span>
                    {role.isDefault && (
                        <span className="text-fg-hint ring-line-2 rounded px-1.5 py-px text-[10px] font-medium tracking-wide uppercase ring-1">
                            default
                        </span>
                    )}
                </div>
            </div>
            <div className="text-fg-hint flex items-center gap-2 text-[11.5px]">
                <User size={12} strokeWidth={1.5} />
                <span>pos {role.position}</span>
            </div>
        </div>
    );
}
