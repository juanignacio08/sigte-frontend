export interface DepartamentoAcademico {
  id: number;
  facultadId: number;
  abreviatura: string;
  denominacion: string;
  estado: number;
  totalEscuelas: number;
  resolucionCreacion?: string; // Opcional para mostrar el subtítulo visual
}