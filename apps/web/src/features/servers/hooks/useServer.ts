import { useQuery } from '@tanstack/react-query';
import { getServer } from '../api/getServer';

export const serverQueryKey = (serverId: string) => ['servers', serverId] as const;

export function useServer(serverId: string) {
    return useQuery({
        queryKey: serverQueryKey(serverId),
        queryFn: () => getServer(serverId),
        enabled: serverId.length > 0,
    });
}
