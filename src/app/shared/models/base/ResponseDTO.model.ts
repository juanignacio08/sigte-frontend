export interface ResponseDTO<T> {
  data: T;
  message: string;
  status: string;
  code: string;
}

export interface PaginatedResponseDTO<T> {
  data: T;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
  message: string;
  status: string;
  code: string;
}