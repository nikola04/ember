import type { ChannelGroupDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function listChannelGroups(serverId: string): Promise<ChannelGroupDTO[]> {
    const res = await api.get<ChannelGroupDTO[]>(`/servers/${serverId}/channel-groups`);
    return res.data;
}
