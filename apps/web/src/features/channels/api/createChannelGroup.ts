import type { ChannelGroupDTO, CreateChannelGroupRequest } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function createChannelGroup(serverId: string, data: CreateChannelGroupRequest): Promise<ChannelGroupDTO> {
    const res = await api.post<ChannelGroupDTO>(`/servers/${serverId}/channel-groups`, data);
    return res.data;
}
