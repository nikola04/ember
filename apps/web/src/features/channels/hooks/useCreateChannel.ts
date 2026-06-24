import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateChannelRequest } from '@ember/protocol';
import { createChannel } from '../api/createChannel';
import { channelsQueryKey } from './useChannels';

export function useCreateChannel(serverId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateChannelRequest) => createChannel(serverId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: channelsQueryKey(serverId) });
        },
    });
}
