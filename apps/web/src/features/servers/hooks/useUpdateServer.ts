import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateServerRequest } from '@ember/protocol';
import { updateServer } from '../api/updateServer';
import { myServersQueryKey } from './useMyServers';
import { serverQueryKey } from './useServer';

export function useUpdateServer(serverId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateServerRequest) => updateServer(serverId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: serverQueryKey(serverId) });
            qc.invalidateQueries({ queryKey: myServersQueryKey });
        },
    });
}
