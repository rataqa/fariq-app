import { useQuery } from '@tanstack/react-query';

import { IApiResponseWithProjects } from '../api/types';
import { useApi } from './useApi';

export function useProjects() {
  const api = useApi();

  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<IApiResponseWithProjects> => {
      return api.getProjects();
    },
  });
}
