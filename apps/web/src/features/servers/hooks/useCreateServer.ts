import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createServer } from '../api/createServer';
import { myServersQueryKey } from './useMyServers';

export function useCreateServer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createServer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: myServersQueryKey });
        },
    });
}
