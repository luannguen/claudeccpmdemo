import { useQuery } from '@tanstack/react-query';
import { userStatsRepository } from '../data/userStatsRepository';

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userStatsRepository.getMyStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export default useUserStats;