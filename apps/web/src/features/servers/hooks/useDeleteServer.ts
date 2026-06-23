import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteServer } from '../api/deleteServer';
import { myServersQueryKey } from './useMyServers';

export function useDeleteServer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteServer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: myServersQueryKey });
        },
    });
}
