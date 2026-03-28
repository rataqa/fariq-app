import { useQuery } from '@tanstack/react-query';

import { IApiResponseWithPullRequestStats } from '../api/types';
import { useApi } from './useApi';

export function useMemberStats(projectId: string, memberId: string, yyyy: string, mm: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['member-stats', projectId, memberId, yyyy, mm],
    queryFn: async (): Promise<IApiResponseWithPullRequestStats> => {
      if (!projectId || !memberId || !yyyy || !mm) return { data: {}, meta: {} };
      return api.getMemberStats(projectId, memberId, yyyy, mm);
    },
  });
}
