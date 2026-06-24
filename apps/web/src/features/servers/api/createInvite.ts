import type { InviteCodeDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function createInvite(serverId: string): Promise<InviteCodeDTO> {
    const res = await api.post<InviteCodeDTO>(`/servers/${serverId}/invites`);
    return res.data;
}
