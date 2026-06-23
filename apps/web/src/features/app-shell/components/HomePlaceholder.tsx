import { useAuth } from '../../auth/context/AuthContext';

export function HomePlaceholder() {
    const { user } = useAuth();
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-[18px] font-medium text-fg-primary">Welcome back, {user?.displayName}</h2>
                <p className="text-[13.5px] text-fg-muted">Pick a server on the left, or create your first one.</p>
            </div>
        </div>
    );
}
