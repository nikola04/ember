import type { UserDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function getMe(): Promise<UserDTO> {
    const res = await api.get<UserDTO>('/users/@me');
    return res.data;
}
