// Shared types and utilities for fariq-app

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export function createApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { data, success: true, message };
}

export function createErrorResponse(message: string): ApiResponse<null> {
  return { data: null, success: false, message };
}
