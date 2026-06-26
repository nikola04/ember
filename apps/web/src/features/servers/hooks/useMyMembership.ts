import { useQuery } from '@tanstack/react-query';
import { getMyMembership } from '../api/getMyMembership';

export function useMyMembership(serverId: string) {
    return useQuery({
        queryKey: ['servers', serverId, 'membership'],
        queryFn: () => getMyMembership(serverId),
        enabled: serverId.length > 0,
    });
}
