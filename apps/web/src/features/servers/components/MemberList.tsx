import type { ServerMemberDTO } from '@ember/protocol';
import { useServerMembers } from '../hooks/useServerMembers';

interface MemberListProps {
    serverId: string;
    ownerId: string;
}

export function MemberList({ serverId, ownerId }: MemberListProps) {
    const { data: members, isLoading } = useServerMembers(serverId);

    return (
        <aside className="flex h-full w-[236px] flex-none flex-col border-l border-line-1 bg-panel">
            <div className="flex h-[56px] flex-none items-center px-[18px]">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-fg-muted">
                    Members{members ? ` — ${members.length}` : ''}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
                {isLoading ? (
                    <MemberSkeleton />
                ) : !members?.length ? (
                    <div className="px-2 py-2 text-[12.5px] text-fg-hint">No members found.</div>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        {members.map((m) => (
                            <MemberRow key={m.id} member={m} isOwner={m.userId === ownerId} />
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

function MemberRow({ member, isOwner }: { member: ServerMemberDTO; isOwner: boolean }) {
    const name = member.user.displayName;
    const initials = name.trim().slice(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-[11px] rounded-[8px] px-2 py-[7px] transition-colors hover:bg-lift">
            <div className="relative flex-none">
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#4f5e72] text-[12px] font-medium text-[#8aa0bd]">
                    {initials}
                </div>
                <span className="absolute -bottom-[1px] -right-[1px] h-[11px] w-[11px] rounded-full border-[2.5px] border-panel bg-online" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-[13.5px] font-medium text-fg-soft">
                    <span className="truncate">{name}</span>
                    {isOwner && (
                        <span className="flex-none rounded px-1 py-px text-[10px] font-medium uppercase tracking-wide text-accent opacity-80">
                            Owner
                        </span>
                    )}
                </div>
                <div className="truncate text-[11px] text-fg-hint">@{member.user.username}</div>
            </div>
        </div>
    );
}

function MemberSkeleton() {
    return (
        <div className="flex flex-col gap-2 px-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="h-[32px] w-[32px] flex-none animate-pulse rounded-[10px] bg-line-2" />
                    <div className="flex flex-1 flex-col gap-1.5">
                        <div className="h-2.5 w-24 animate-pulse rounded bg-line-2" />
                        <div className="h-2 w-16 animate-pulse rounded bg-line-1" />
                    </div>
                </div>
            ))}
        </div>
    );
}
