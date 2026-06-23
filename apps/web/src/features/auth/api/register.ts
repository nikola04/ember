import type { AuthUserDTO, RegisterRequest } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function register(data: RegisterRequest): Promise<AuthUserDTO> {
    const res = await api.post<AuthUserDTO>('/auth/register', data);
    return res.data;
}
