import type { InviteDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function listInvites(serverId: string): Promise<InviteDTO[]> {
    const res = await api.get<InviteDTO[]>(`/servers/${serverId}/invites`);
    return res.data;
}
