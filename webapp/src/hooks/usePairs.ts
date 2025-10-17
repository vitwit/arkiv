import { useQuery } from '@tanstack/react-query';
import { getPairs } from '../lib/dcaQuery';
import type { Pair } from '../lib/dcaQuery';

export function usePairs() {
    return useQuery<Pair[]>({
        queryKey: ['pairs'],
        queryFn: getPairs,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
