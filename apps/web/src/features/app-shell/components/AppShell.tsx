import { Outlet } from 'react-router-dom';
import { ServerRail } from '../../servers/components/ServerRail';

export function AppShell() {
    return (
        <div className="relative flex h-screen w-screen overflow-hidden bg-main font-sans text-fg-body">
            <ServerRail />
            <main className="relative flex min-w-0 flex-1">
                <Outlet />
            </main>
            <div className="pointer-events-none absolute inset-0 z-50" style={{ boxShadow: 'inset 0 0 180px 40px rgba(0,0,0,.45)' }} />
        </div>
    );
}
