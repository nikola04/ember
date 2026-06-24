import { useQuery } from '@tanstack/react-query';
import { listChannels } from '../api/listChannels';

export const channelsQueryKey = (serverId: string) => ['servers', serverId, 'channels'] as const;

export function useChannels(serverId: string) {
    return useQuery({
        queryKey: channelsQueryKey(serverId),
        queryFn: () => listChannels(serverId),
        enabled: serverId.length > 0,
    });
}
