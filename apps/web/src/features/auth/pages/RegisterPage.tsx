import { Link, Navigate, useNavigate } from 'react-router-dom';
import { EmberLogo } from '../../../components/EmberLogo';
import { useAuth } from '../context/AuthContext';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="bg-rail flex h-screen w-screen items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-8 px-6 py-12">
                <div className="flex flex-col items-center gap-3">
                    <EmberLogo size={40} animate={false} />
                    <h1 className="text-fg-primary text-[20px] font-medium">Create your Ember account</h1>
                </div>
                <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
                <p className="text-fg-muted text-[13px]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
