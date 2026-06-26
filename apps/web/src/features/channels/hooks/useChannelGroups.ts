import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listChannelGroups } from '../api/listChannelGroups';
import { createChannelGroup } from '../api/createChannelGroup';
import type { CreateChannelGroupRequest } from '@ember/protocol';

export const channelGroupsQueryKey = (serverId: string) => ['servers', serverId, 'channel-groups'] as const;

export function useChannelGroups(serverId: string) {
    return useQuery({
        queryKey: channelGroupsQueryKey(serverId),
        queryFn: () => listChannelGroups(serverId),
        enabled: serverId.length > 0,
    });
}

export function useCreateChannelGroup(serverId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateChannelGroupRequest) => createChannelGroup(serverId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: channelGroupsQueryKey(serverId) });
        },
    });
}
