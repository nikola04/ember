import type { ServerMembershipDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function getMyMembership(serverId: string): Promise<ServerMembershipDTO> {
    const res = await api.get<ServerMembershipDTO>(`/servers/${serverId}/@me`);
    return res.data;
}
