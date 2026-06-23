import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/logout';
import { meQueryKey } from '../../users/hooks/useMe';

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            qc.setQueryData(meQueryKey, null);
            qc.clear();
        },
    });
}
