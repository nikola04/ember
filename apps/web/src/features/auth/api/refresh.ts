import { api } from '../../../lib/axios';

export async function refresh(): Promise<void> {
    await api.post('/auth/refresh');
}
