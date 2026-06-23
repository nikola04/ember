import type { ServerDetailsDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function getServer(serverId: string): Promise<ServerDetailsDTO> {
    const res = await api.get<ServerDetailsDTO>(`/servers/${serverId}`);
    return res.data;
}
