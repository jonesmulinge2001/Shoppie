/* eslint-disable prettier/prettier */
export interface ApiResponse<T = unknown> {
    [x: string]: any;
    success: boolean;
    message: string;
    data?: T;
    timestamp?: string;
    path?: string;
    code?: number;
    error?: string;
    errors?: Record<string, string[]>;
    token?: string;
  }
  
  export interface PaginatedApiResponse<T>
    extends Omit<ApiResponse<T[]>, 'data'> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }
  