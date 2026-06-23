import { useQuery } from '@tanstack/react-query';
import { listMyServers } from '../api/listMyServers';

export const myServersQueryKey = ['servers', 'me'] as const;

export function useMyServers() {
    return useQuery({
        queryKey: myServersQueryKey,
        queryFn: listMyServers,
    });
}
