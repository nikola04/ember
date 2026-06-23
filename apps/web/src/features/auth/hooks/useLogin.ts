import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../api/login';
import { meQueryKey } from '../../users/hooks/useMe';

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: login,
        onSuccess: (user) => {
            qc.setQueryData(meQueryKey, user);
        },
    });
}
