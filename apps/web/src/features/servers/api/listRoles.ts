import type { RoleDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function listRoles(serverId: string): Promise<RoleDTO[]> {
    const res = await api.get<RoleDTO[]>(`/servers/${serverId}/roles`);
    return res.data;
}
