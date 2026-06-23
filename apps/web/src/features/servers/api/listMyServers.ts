import type { ServerDTO } from '@ember/protocol';
import { api } from '../../../lib/axios';

export async function listMyServers(): Promise<ServerDTO[]> {
    const res = await api.get<ServerDTO[]>('/servers/@me');
    return res.data;
}
