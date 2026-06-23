import type { ServerMemberDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function listServerMembers(serverId: string): Promise<ServerMemberDTO[]> {
    const res = await api.get<ServerMemberDTO[]>(`/servers/${serverId}/members`);
    return res.data;
}
