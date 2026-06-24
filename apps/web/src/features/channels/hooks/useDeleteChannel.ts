import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChannel } from '../api/deleteChannel';
import { channelsQueryKey } from './useChannels';

export function useDeleteChannel(serverId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (channelId: string) => deleteChannel(serverId, channelId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: channelsQueryKey(serverId) });
        },
    });
}
