import { useQuery } from '@tanstack/react-query';
import { listServerMembers } from '../api/listServerMembers';

export const serverMembersQueryKey = (serverId: string) => ['servers', serverId, 'members'] as const;

export function useServerMembers(serverId: string) {
    return useQuery({
        queryKey: serverMembersQueryKey(serverId),
        queryFn: () => listServerMembers(serverId),
        enabled: serverId.length > 0,
    });
}
