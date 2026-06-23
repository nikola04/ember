import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChannel } from '../api/deleteChannel';
import { serverQueryKey } from '../../servers/hooks/useServer';

export function useDeleteChannel(serverId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (channelId: string) => deleteChannel(serverId, channelId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: serverQueryKey(serverId) });
        },
    });
}
