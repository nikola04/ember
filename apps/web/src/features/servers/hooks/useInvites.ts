import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listInvites } from '../api/listInvites';
import { deleteInvite } from '../api/deleteInvite';

export const invitesQueryKey = (serverId: string) => ['servers', serverId, 'invites'] as const;

export function useInvites(serverId: string) {
    return useQuery({
        queryKey: invitesQueryKey(serverId),
        queryFn: () => listInvites(serverId),
        enabled: serverId.length > 0,
    });
}

export function useDeleteInvite(serverId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (code: string) => deleteInvite(serverId, code),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: invitesQueryKey(serverId) });
        },
    });
}
