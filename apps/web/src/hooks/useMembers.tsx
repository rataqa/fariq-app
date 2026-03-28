import { useQuery } from '@tanstack/react-query';

import { IApiResponseWithMembers } from '../api/types';
import { useApi } from './useApi';

export function useMembers(projectId: string, teamId: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['members', projectId, teamId],
    queryFn: async (): Promise<IApiResponseWithMembers> => {
      if (!projectId || !teamId) return { data: [], count: 0 };
      return api.getMembers(projectId, teamId);
    },
  });
}
