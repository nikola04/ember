import { useQuery } from '@tanstack/react-query';
import { listRoles } from '../api/listRoles';

export const rolesQueryKey = (serverId: string) => ['servers', serverId, 'roles'] as const;

export function useRoles(serverId: string) {
    return useQuery({
        queryKey: rolesQueryKey(serverId),
        queryFn: () => listRoles(serverId),
        enabled: serverId.length > 0,
    });
}
