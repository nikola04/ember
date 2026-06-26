import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { AppShell } from './features/app-shell/components/AppShell';
import { HomePlaceholder } from './features/app-shell/components/HomePlaceholder';
import { ServerPage } from './features/servers/pages/ServerPage';
import { ContextMenuProvider } from './components/ContextMenu';

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <ContextMenuProvider>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route element={<ProtectedRoute />}>
                                <Route element={<AppShell />}>
                                    <Route index element={<HomePlaceholder />} />
                                    <Route path="servers/:id" element={<ServerPage />} />
                                </Route>
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ContextMenuProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
