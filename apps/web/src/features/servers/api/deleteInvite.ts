import { api } from '../../../lib/axios';

export async function deleteInvite(serverId: string, code: string): Promise<void> {
    await api.delete(`/servers/${serverId}/invites/${code}`);
}
