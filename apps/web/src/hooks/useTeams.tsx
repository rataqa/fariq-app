import { useQuery } from '@tanstack/react-query';

import { IApiResponseWithTeams } from '../api/types';
import { useApi } from './useApi';

export function useTeams(projectId: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['teams', projectId],
    queryFn: async (): Promise<IApiResponseWithTeams> => {
      if (!projectId) return { data: [], count: 0 };
      return api.getTeams(projectId);
    },
  });
}
