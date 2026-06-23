import type { ChannelDTO, CreateChannelRequest } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function createChannel(serverId: string, data: CreateChannelRequest): Promise<ChannelDTO> {
    const res = await api.post<ChannelDTO>(`/servers/${serverId}/channels`, data);
    return res.data;
}
