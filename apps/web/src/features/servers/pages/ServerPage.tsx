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
                <aside className="border-line-1 bg-panel flex h-full w-[244px] flex-none flex-col border-r">
                    <div className="border-line-1 h-[56px] border-b" />
                </aside>
                <div className="text-fg-hint flex flex-1 items-center justify-center text-[13px]">Loading…</div>
            </>
        );
    }

    if (error || !server) {
        return (
            <div className="text-fg-hint flex flex-1 items-center justify-center text-[13px]">
                Server not found or you don't have access.
            </div>
        );
    }

    return (
        <>
            <ChannelSidebar server={server} />

            <div
                className="bg-main relative flex min-w-0 flex-1 flex-col"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 22% -8%, rgba(233,129,102,.09), transparent 48%), radial-gradient(circle at 80% 110%, rgba(233,129,102,.04), transparent 50%)',
                }}
            >
                <ServerTopBar server={server} membersOpen={membersOpen} onToggleMembers={() => setMembersOpen((v) => !v)} />

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                        <div className="border-line-3 bg-lift text-fg-dim flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border">
                            <MessageSquare size={22} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-fg-primary text-[15px] font-medium">Select a channel</div>
                            <div className="text-fg-dim mt-1 text-[12.5px]">Pick a text channel from the sidebar to start chatting.</div>
                        </div>
                    </div>

                    {membersOpen && <MemberList serverId={id} ownerId={server.ownerId} />}
                </div>
            </div>
        </>
    );
}
