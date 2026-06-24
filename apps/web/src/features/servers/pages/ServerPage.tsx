import { Navigate, useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { ChannelSidebar } from '../../channels/components/ChannelSidebar';
import { useServer } from '../hooks/useServer';
import { ServerTopBar } from '../components/ServerTopBar';
import { MemberList } from '../components/MemberList';

export function ServerPage() {
    const { id } = useParams<{ id: string }>();
    const { data: server, isLoading, error } = useServer(id ?? '');
    const [membersOpen, setMembersOpen] = useState(true);

    if (!id) return <Navigate to="/" replace />;

    if (isLoading) {
        return (
            <>
                <aside className="flex h-full w-[244px] flex-none flex-col border-r border-line-1 bg-panel">
                    <div className="h-[56px] border-b border-line-1" />
                </aside>
                <div className="flex flex-1 items-center justify-center text-[13px] text-fg-hint">Loading…</div>
            </>
        );
    }

    if (error || !server) {
        return (
            <div className="flex flex-1 items-center justify-center text-[13px] text-fg-hint">
                Server not found or you don't have access.
            </div>
        );
    }

    return (
        <>
            <ChannelSidebar server={server} />

            <div
                className="relative flex min-w-0 flex-1 flex-col"
                style={{
                    backgroundColor: '#111118',
                    backgroundImage:
                        'radial-gradient(circle at 22% -8%, rgba(227,93,58,.10), transparent 48%), radial-gradient(circle at 80% 110%, rgba(227,93,58,.04), transparent 50%)',
                }}
            >
                <ServerTopBar server={server} membersOpen={membersOpen} onToggleMembers={() => setMembersOpen((v) => !v)} />

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-line-3 bg-[#181820] text-fg-dim">
                            <MessageSquare size={22} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-[15px] font-medium text-fg-primary">Select a channel</div>
                            <div className="mt-1 text-[12.5px] text-fg-dim">Pick a text channel from the sidebar to start chatting.</div>
                        </div>
                    </div>

                    {membersOpen && <MemberList serverId={id} ownerId={server.ownerId} />}
                </div>
            </div>
        </>
    );
}
