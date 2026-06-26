import { Link, Navigate, useNavigate } from 'react-router-dom';
import { EmberLogo } from '../../../components/EmberLogo';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="bg-rail flex h-screen w-screen items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-8 px-6">
                <div className="flex flex-col items-center gap-3">
                    <EmberLogo size={40} animate={false} />
                    <h1 className="text-fg-primary text-[20px] font-medium">Welcome back to Ember</h1>
                </div>
                <LoginForm onSuccess={() => navigate('/', { replace: true })} />
                <p className="text-fg-muted text-[13px]">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-accent hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
