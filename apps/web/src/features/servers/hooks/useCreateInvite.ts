import { useMutation } from '@tanstack/react-query';
import { createInvite } from '../api/createInvite';

export function useCreateInvite() {
    return useMutation({
        mutationFn: (serverId: string) => createInvite(serverId),
    });
}
