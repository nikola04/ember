import { api } from '../../../lib/axios';

export async function logout(): Promise<void> {
    await api.post('/auth/logout');
}
