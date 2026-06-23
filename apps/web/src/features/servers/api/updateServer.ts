import type { ServerDTO, UpdateServerRequest } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function updateServer(serverId: string, data: UpdateServerRequest): Promise<ServerDTO> {
    const res = await api.patch<ServerDTO>(`/servers/${serverId}`, data);
    return res.data;
}
