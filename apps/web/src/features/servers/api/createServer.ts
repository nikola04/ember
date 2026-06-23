import type { CreateServerRequest, ServerDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function createServer(data: CreateServerRequest): Promise<ServerDTO> {
    const res = await api.post<ServerDTO>('/servers', data);
    return res.data;
}
