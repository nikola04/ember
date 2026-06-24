import type { ChannelDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function listChannels(serverId: string): Promise<ChannelDTO[]> {
    const res = await api.get<ChannelDTO[]>(`/servers/${serverId}/channels`);
    return res.data;
}
