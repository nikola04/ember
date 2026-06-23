import type { AuthUserDTO, LoginRequest } from '@ember/protocol';
import { api } from '../../../lib/axios';

interface LoginResponse {
    user: AuthUserDTO;
}

export async function login(data: LoginRequest): Promise<AuthUserDTO> {
    const res = await api.post<LoginResponse>('/auth/login', data);
    return res.data.user;
}
