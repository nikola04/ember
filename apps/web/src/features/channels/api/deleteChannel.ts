import { api } from '../../../lib/axios';

export async function deleteChannel(serverId: string, channelId: string): Promise<void> {
    await api.delete(`/servers/${serverId}/channels/${channelId}`);
}
