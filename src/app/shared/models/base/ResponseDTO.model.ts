export interface ResponseDTO<T> {
  data: T
  message: string
  status: string
  code: string
}

export interface PaginatedResponseDTO<T> {
  totalItems: number
  totalPages: number
  currentPage: number
  data: T
  message: string
  status: string
  code: string
}