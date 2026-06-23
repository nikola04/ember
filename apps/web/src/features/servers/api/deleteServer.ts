import { api } from '../../../lib/axios';

export async function deleteServer(serverId: string): Promise<void> {
    await api.delete(`/servers/${serverId}`);
}
