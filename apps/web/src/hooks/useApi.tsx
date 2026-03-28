import { useContext } from 'react';
import { ApiContext } from '../contexts/ApiContext';

export function useApi() {
  const ctx = useContext(ApiContext);
  return ctx;
}
