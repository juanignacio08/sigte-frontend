import { HttpRequest } from '@angular/common/http';
import { DepartamentoAcademico } from '../../shared/models/master/departamento_academico.model';
import { EscuelaProfesional } from '../../shared/models/master/escuela_profesional.model';
import { PlantillaDocumento } from '../../shared/models/master/plantilla-documento.model';
import { Docente, DocenteFiltro, DocenteRequest } from '../../shared/models/personas/docente.model';
import { MasterTable, MasterTableRequest } from '../../shared/models/master/tabla_maestra.model';
import { Estudiante, EstudianteFiltro, EstudianteRequest } from '../../shared/models/personas/estudiante.model';
import { Expediente, ExpedienteArchivo } from '../../shared/models/tramites/expediente.model';
import { Tesis, TesisAutor, TesisFiltro } from '../../shared/models/tramites/tesis.model';
import { Comision, ComisionMiembro, ComisionMiembroRequest, ComisionRequest } from '../../shared/models/tramites/comision.model';
import { EnvioCorreo } from '../../shared/models/tramites/contenido-email';
import { DocumentoTesis, GenerarMemoRequest, GenerarResolucionProyectoRequest } from '../../shared/models/tramites/documento-tesis.model';

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path?: string; // <-- NUEVO (ej. '/expediente/:id')
  test?: (url: string) => boolean; // <-- El viejo método sigue funcionando
  handle: (req: HttpRequest<any>) => any;
}

let departamentosDB: DepartamentoAcademico[] = [
  {
    "id": 1,
    "facultadId": 1,
    "abreviatura": "DAENF",
    "denominacion": "Departamento Académico de Enfermería",
    "estado": 1,
    "totalEscuelas": 1
  },
  {
    "id": 2,
    "facultadId": 1,
    "abreviatura": "DAMH",
    "denominacion": "Departamento Académico de Medicina Humana",
    "estado": 1,
    "totalEscuelas": 2
  },
  {
    "id": 3,
    "facultadId": 1,
    "abreviatura": "DAOBS",
    "denominacion": "Departamento Académico de Obstetricia",
    "estado": 1,
    "totalEscuelas": 1
  },
];
let nextDepartamentoId = 100;

// =====================================================
// ESCUELAS PROFESIONALES
// =====================================================
let escuelasDB: EscuelaProfesional[] = [
  {
    id: 1,
    departamento: departamentosDB[0], // Enfermería
    codigo: 14,
    abreviatura: 'EPENF',
    denominacion: 'Escuela Profesional de Enfermería',
    estado: 1
  },
  {
    id: 2,
    departamento: departamentosDB[1], // Medicina Humana
    codigo: 15,
    abreviatura: 'EPMH',
    denominacion: 'Escuela Profesional de Medicina Humana',
    estado: 1
  },
  {
    id: 3,
    departamento: departamentosDB[1], // Medicina Humana
    codigo: 16,
    abreviatura: 'EPFB',
    denominacion: 'Escuela Profesional de Farmacia y Bioquímica',
    estado: 1
  },
  {
    id: 4,
    departamento: departamentosDB[2], // Obstetricia
    codigo: 17,
    abreviatura: 'EPOB',
    denominacion: 'Escuela Profesional de Obstetricia',
    estado: 1
  },
];
let nextEscuelaId = 100;

const TIPOS_DOCUMENTO_MAP: Record<string, string> = {
  '006001': 'Memorando de Proyecto de tesis',
  '006002': 'Memorando de Borrador de tesis',
  '006005': 'Resolución de Aprobación de Proyecto',
  '006006': 'Resolución de Fecha y Hora',
};

// =====================================================
// PLANTILLAS DE DOCUMENTO
// =====================================================
let plantillasDB: PlantillaDocumento[] = [
  {
    id: 1,
    escuelaId: 1, // Enfermería
    nombreDocumento: 'Plantilla de Memorando de Proyecto.docx',
    tipoDocumentoCodigo: '006001',
    tipoDocumentoDenominacion: 'Memorando de Proyecto de tesis',
    archivoUrl: 'mock/plantilla-proyecto.docx',
    plazoDias: 5,
    plazoMeses: null,
    estado: 1
  },
  {
    id: 2,
    escuelaId: 1, // Enfermería
    nombreDocumento: 'Plantilla de Memorando de Borrador.docx',
    tipoDocumentoCodigo: '006002',
    tipoDocumentoDenominacion: 'Memorando de Borrador de tesis',
    archivoUrl: 'mock/plantilla-borrador.docx',
    plazoDias: 5,
    plazoMeses: null,
    estado: 1
  },
  {
    id: 3,
    escuelaId: 1, // Enfermería
    nombreDocumento: 'Plantilla de Resolución de Proyecto.docx',
    tipoDocumentoCodigo: '006005',
    tipoDocumentoDenominacion: 'Resolución de Aprobación de Proyecto',
    archivoUrl: 'mock/plantilla-resolucion.docx',
    plazoDias: null,
    plazoMeses: 1,
    estado: 1
  },
  {
    id: 4,
    escuelaId: 2, // Medicina Humana
    nombreDocumento: 'Plantilla de Borrador de tesis.docx',
    tipoDocumentoCodigo: '006002',
    tipoDocumentoDenominacion: 'Memorando de Borrador de tesis',
    archivoUrl: 'mock/plantilla-borrador.docx',
    plazoDias: 10,
    plazoMeses: null,
    estado: 1
  }
];
let nextPlantillaId = 100;

// =====================================================
// DOCENTES
// =====================================================
let docentesDB: Docente[] = [
  // =========================================================================
  // DEPARTAMENTO: Enfermería (departamentosDB[0]) -> ESCUELA: Enfermería (escuelasDB[0])
  // =========================================================================
  {
    id: 1,
    codigo: 'DOC001',
    escuela: escuelasDB[0],
    departamento: departamentosDB[0],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '12345678',
    nombres: 'Juan',
    primerApellido: 'Perez',
    segundoApellido: 'Gomez',
    correoInstitucional: 'juan.perez@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '987654321',
    estado: 1,
    eliminado: false,
    fullName: 'Juan Perez Gomez'
  },
  {
    id: 2,
    codigo: 'DOC002',
    escuela: escuelasDB[0],
    departamento: departamentosDB[0],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '87654321',
    nombres: 'Maria',
    primerApellido: 'Lopez',
    segundoApellido: 'Diaz',
    correoInstitucional: 'maria.lopez@unsch.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'Femenino',
    telefono: '912345678',
    estado: 1,
    eliminado: false,
    fullName: 'Maria Lopez Diaz'
  },
  {
    id: 3,
    codigo: 'DOC003',
    escuela: escuelasDB[0],
    departamento: departamentosDB[0],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '11223344',
    nombres: 'Carlos',
    primerApellido: 'Ruiz',
    segundoApellido: 'Soto',
    correoInstitucional: 'carlos.ruiz@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '955667788',
    estado: 0,
    eliminado: false,
    fullName: 'Carlos Ruiz Soto'
  },
  {
    id: 4,
    codigo: 'DOC004',
    escuela: escuelasDB[0],
    departamento: departamentosDB[0],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '11223345',
    nombres: 'Manuel',
    primerApellido: 'Ruiz',
    segundoApellido: 'Soto',
    correoInstitucional: 'manuel.ruiz@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '955667789',
    estado: 0,
    eliminado: false,
    fullName: 'Manuel Ruiz Soto'
  },

  // =========================================================================
  // DEPARTAMENTO: Medicina Humana (departamentosDB[1]) -> ESCUELA: Medicina Humana (escuelasDB[1])
  // =========================================================================
  {
    id: 5,
    codigo: 'DOC005',
    escuela: escuelasDB[1],
    departamento: departamentosDB[1],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '28291045',
    nombres: 'Roberto',
    primerApellido: 'Mendoza',
    segundoApellido: 'Quispe',
    correoInstitucional: 'roberto.mendoza@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '966112233',
    estado: 1,
    eliminado: false,
    fullName: 'Roberto Mendoza Quispe'
  },
  {
    id: 6,
    codigo: 'DOC006',
    escuela: escuelasDB[1],
    departamento: departamentosDB[1],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '41526374',
    nombres: 'Elena',
    primerApellido: 'Vargas',
    segundoApellido: 'Cardenas',
    correoInstitucional: 'elena.vargas@unsch.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'Femenino',
    telefono: '966445566',
    estado: 1,
    eliminado: false,
    fullName: 'Elena Vargas Cardenas'
  },
  {
    id: 7,
    codigo: 'DOC007',
    escuela: escuelasDB[1],
    departamento: departamentosDB[1],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '28309812',
    nombres: 'Jorge Luis',
    primerApellido: 'Huamani',
    segundoApellido: 'Paredes',
    correoInstitucional: 'jorge.huamani@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '966778899',
    estado: 1,
    eliminado: false,
    fullName: 'Jorge Luis Huamani Paredes'
  },

  // =========================================================================
  // DEPARTAMENTO: Medicina Humana (departamentosDB[1]) -> ESCUELA: Farmacia y Bioquímica (escuelasDB[2])
  // =========================================================================
  {
    id: 8,
    codigo: 'DOC008',
    escuela: escuelasDB[2],
    departamento: departamentosDB[1],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '40918273',
    nombres: 'Patricia',
    primerApellido: 'Salazar',
    segundoApellido: 'Rojas',
    correoInstitucional: 'patricia.salazar@unsch.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'Femenino',
    telefono: '999123456',
    estado: 1,
    eliminado: false,
    fullName: 'Patricia Salazar Rojas'
  },
  {
    id: 9,
    codigo: 'DOC009',
    escuela: escuelasDB[2],
    departamento: departamentosDB[1],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '28245619',
    nombres: 'Fernando',
    primerApellido: 'Castillo',
    segundoApellido: 'Flores',
    correoInstitucional: 'fernando.castillo@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '999654321',
    estado: 1,
    eliminado: false,
    fullName: 'Fernando Castillo Flores'
  },
  {
    id: 10,
    codigo: 'DOC010',
    escuela: escuelasDB[2],
    departamento: departamentosDB[1],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '43876512',
    nombres: 'Lucia',
    primerApellido: 'Torres',
    segundoApellido: 'Miranda',
    correoInstitucional: 'lucia.torres@unsch.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'Femenino',
    telefono: '999887766',
    estado: 0,
    eliminado: false,
    fullName: 'Lucia Torres Miranda'
  },

  // =========================================================================
  // DEPARTAMENTO: Obstetricia (departamentosDB[2]) -> ESCUELA: Obstetricia (escuelasDB[3])
  // =========================================================================
  {
    id: 11,
    codigo: 'DOC011',
    escuela: escuelasDB[3],
    departamento: departamentosDB[2],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '28276543',
    nombres: 'Rosa Amelia',
    primerApellido: 'Chavez',
    segundoApellido: 'Palomino',
    correoInstitucional: 'rosa.chavez@unsch.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'Femenino',
    telefono: '988111222',
    estado: 1,
    eliminado: false,
    fullName: 'Rosa Amelia Chavez Palomino'
  },
  {
    id: 12,
    codigo: 'DOC012',
    escuela: escuelasDB[3],
    departamento: departamentosDB[2],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '42198374',
    nombres: 'Gabriela',
    primerApellido: 'Ramos',
    segundoApellido: 'Arotoma',
    correoInstitucional: 'gabriela.ramos@unsch.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'Femenino',
    telefono: '988333444',
    estado: 1,
    eliminado: false,
    fullName: 'Gabriela Ramos Arotoma'
  },
  {
    id: 13,
    codigo: 'DOC013',
    escuela: escuelasDB[3],
    departamento: departamentosDB[2],
    tipoDocumentoCodigo: '001001',
    tipoDocumentoDenominacion: 'DNI',
    numeroDocumento: '28312398',
    nombres: 'Victor Hugo',
    primerApellido: 'Alarcon',
    segundoApellido: ' Medina',
    correoInstitucional: 'victor.alarcon@unsch.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'Masculino',
    telefono: '988555666',
    estado: 1,
    eliminado: false,
    fullName: 'Victor Hugo Alarcon Medina'
  }
];
let nextDocenteId = 100;

departamentosDB.forEach(depto => {
  depto.escuelas = escuelasDB.filter(e => e.departamento.id === depto.id);
  depto.totalEscuelas = depto.escuelas.length;
});

// =====================================================
// TABLAS MAESTRAS
// =====================================================
let maestrosDB: MasterTable[] = [
  // --- AGRUPADORES (Padres) ---
  { id: 1, tableCode: '001', itemCode: '000', code: '001000', denomination: 'TIPO DE DOCUMENTO', isSystem: true, state: 1 },
  { id: 2, tableCode: '002', itemCode: '000', code: '002000', denomination: 'GENERO', isSystem: true, state: 1 },
  { id: 3, tableCode: '003', itemCode: '000', code: '003000', denomination: 'ESTADO GLOBAL DE TESIS', isSystem: true, state: 1 },
  { id: 4, tableCode: '004', itemCode: '000', code: '004000', denomination: 'ETAPA DE TRAMITE', isSystem: true, state: 1 },
  { id: 5, tableCode: '005', itemCode: '000', code: '005000', denomination: 'ROL EN COMISIÓN', isSystem: true, state: 1 },
  { id: 6, tableCode: '006', itemCode: '000', code: '006000', denomination: 'TIPO DE DOCUMENTO', isSystem: true, state: 1 },
  { id: 7, tableCode: '007', itemCode: '000', code: '007000', denomination: 'ESTADO DE EXPEDIENTE', isSystem: true, state: 1 },
  { id: 8, tableCode: '008', itemCode: '000', code: '008000', denomination: 'RESULTADO DOCUMENTO', isSystem: true, state: 1 },
  { id: 9, tableCode: '009', itemCode: '000', code: '009000', denomination: 'ESTADO DE DOCUMENTO', isSystem: true, state: 1 },

  // --- ÍTEMS (Hijos) ---
  // 001
  { id: 10, tableCode: '001', itemCode: '001', code: '001001', denomination: 'DNI', isSystem: true, state: 1 },
  { id: 11, tableCode: '001', itemCode: '002', code: '001002', denomination: 'CARNET DE EXTRANJERÍA', isSystem: true, state: 1 },
  { id: 12, tableCode: '001', itemCode: '003', code: '001003', denomination: 'PASAPORTE', isSystem: false, state: 1 },
  // 002
  { id: 13, tableCode: '002', itemCode: '001', code: '002001', denomination: 'MASCULINO', isSystem: true, state: 1 },
  { id: 14, tableCode: '002', itemCode: '002', code: '002002', denomination: 'FEMENINO', isSystem: true, state: 1 },
  // 003
  { id: 15, tableCode: '003', itemCode: '001', code: '003001', denomination: 'EN TRAMITE', isSystem: true, state: 1 },
  { id: 16, tableCode: '003', itemCode: '002', code: '003002', denomination: 'APROBADO', isSystem: true, state: 1 },
  { id: 17, tableCode: '003', itemCode: '003', code: '003003', denomination: 'OBSERVADO', isSystem: true, state: 1 },
  { id: 18, tableCode: '003', itemCode: '004', code: '003004', denomination: 'SUSTENTADO', isSystem: true, state: 1 },
  { id: 19, tableCode: '003', itemCode: '005', code: '003005', denomination: 'CANCELADO / ARCHIVADO', isSystem: false, state: 1 },
  // 004
  { id: 20, tableCode: '004', itemCode: '001', code: '004001', denomination: 'PROYECTO DE TESIS', isSystem: true, state: 1 },
  { id: 21, tableCode: '004', itemCode: '002', code: '004002', denomination: 'BORRADOR DE TESIS', isSystem: true, state: 1 },
  { id: 22, tableCode: '004', itemCode: '003', code: '004003', denomination: 'MODIFICACIÓN DE PROYECTO', isSystem: true, state: 1 },
  { id: 23, tableCode: '004', itemCode: '004', code: '004004', denomination: 'SUSTENTACIÓN DE TESIS', isSystem: true, state: 1 },
  // 005
  { id: 24, tableCode: '005', itemCode: '001', code: '005001', denomination: 'PRESIDENTE', isSystem: true, state: 1 },
  { id: 25, tableCode: '005', itemCode: '002', code: '005002', denomination: 'MIEMBRO', isSystem: true, state: 1 },
  { id: 26, tableCode: '005', itemCode: '003', code: '005003', denomination: 'COASESOR', isSystem: true, state: 1 },
  { id: 27, tableCode: '005', itemCode: '004', code: '005004', denomination: 'ASESOR', isSystem: true, state: 1 },
  { id: 28, tableCode: '005', itemCode: '005', code: '005005', denomination: 'PRESIDENTE DE SUSTENTACIÓN', isSystem: true, state: 1 },
  { id: 29, tableCode: '005', itemCode: '007', code: '005007', denomination: 'SECRETARIO DOCENTE', isSystem: true, state: 1 },
  // 006
  { id: 30, tableCode: '006', itemCode: '001', code: '006001', denomination: 'MEMORANDO DE PROYECTO', isSystem: true, state: 1 },
  { id: 31, tableCode: '006', itemCode: '002', code: '006002', denomination: 'MEMORANDO DE BORRADOR', isSystem: true, state: 1 },
  { id: 32, tableCode: '006', itemCode: '003', code: '006003', denomination: 'MEMORANDO DE MODIFICACIÓN', isSystem: true, state: 1 },
  { id: 33, tableCode: '006', itemCode: '004', code: '006004', denomination: 'DICTAMEN', isSystem: true, state: 1 },
  { id: 34, tableCode: '006', itemCode: '005', code: '006005', denomination: 'RESOLUCIÓN DE APROBACIÓN DE PROYECTO', isSystem: true, state: 1 },
  { id: 35, tableCode: '006', itemCode: '006', code: '006006', denomination: 'RESOLUCIÓN DE FECHA Y HORA', isSystem: true, state: 1 },
  { id: 36, tableCode: '006', itemCode: '007', code: '006007', denomination: 'ACTA DE SUSTENTACIÓN', isSystem: true, state: 1 },
  // 007
  { id: 37, tableCode: '007', itemCode: '001', code: '007001', denomination: 'REGISTRADO', isSystem: true, state: 1 },
  { id: 38, tableCode: '007', itemCode: '002', code: '007002', denomination: 'MEMORANDO GENERADO', isSystem: true, state: 1 },
  { id: 39, tableCode: '007', itemCode: '003', code: '007003', denomination: 'MEMORANDO ENVIADO', isSystem: true, state: 1 },
  { id: 40, tableCode: '007', itemCode: '004', code: '007004', denomination: 'DICTAMINADO - APROBADO', isSystem: true, state: 1 },
  { id: 41, tableCode: '007', itemCode: '005', code: '007005', denomination: 'DICTAMINADO - OBSERVADO', isSystem: true, state: 1 },
  { id: 42, tableCode: '007', itemCode: '006', code: '007006', denomination: 'APROBADO', isSystem: true, state: 1 },
  { id: 43, tableCode: '007', itemCode: '007', code: '007007', denomination: 'PROGRAMADO', isSystem: true, state: 1 },
  // 008
  { id: 44, tableCode: '008', itemCode: '001', code: '008001', denomination: 'DICTAMEN APROBADO', isSystem: true, state: 1 },
  { id: 45, tableCode: '008', itemCode: '002', code: '008002', denomination: 'DICTAMEN OBSERVADO', isSystem: true, state: 1 },
  // 009
  { id: 46, tableCode: '009', itemCode: '001', code: '009001', denomination: 'GENERADO', isSystem: true, state: 1 },
  { id: 47, tableCode: '009', itemCode: '002', code: '009002', denomination: 'ENVIADO', isSystem: true, state: 1 },
  { id: 48, tableCode: '009', itemCode: '003', code: '009003', denomination: 'ANULADO', isSystem: true, state: 1 },
  { id: 49, tableCode: '009', itemCode: '004', code: '009004', denomination: 'RECIBIDO', isSystem: true, state: 1 },
];
let nextMaestroId = 100;

// =====================================================
// ESTUDIANTES
// =====================================================
let estudiantesDB: Estudiante[] = [
  // 2 de Enfermería (escuelasDB[0])
  {
    id: 1,
    codigo: '2021001',
    escuela: escuelasDB[0],
    numeroDocumento: '11223344',
    nombres: 'Ana',
    primerApellido: 'Torres',
    segundoApellido: 'Vega',
    correoInstitucional: 'ana.torres@unsm.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'FEMENINO',
    telefono: '987654321',
    estado: 1,
    eliminado: false
  },
  {
    id: 2,
    codigo: '2021002',
    escuela: escuelasDB[0],
    numeroDocumento: '22334455',
    nombres: 'Luis',
    primerApellido: 'Ramirez',
    segundoApellido: 'Soto',
    correoInstitucional: 'luis.ramirez@unsm.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'MASCULINO',
    telefono: '912345678',
    estado: 1,
    eliminado: false
  },
  // 1 de Medicina (escuelasDB[1])
  {
    id: 3,
    codigo: '2021003',
    escuela: escuelasDB[1],
    numeroDocumento: '33445566',
    nombres: 'Carlos',
    primerApellido: 'Mendoza',
    segundoApellido: 'Paz',
    correoInstitucional: 'carlos.mendoza@unsm.edu.pe',
    generoCodigo: '002001',
    generoDenominacion: 'MASCULINO',
    telefono: '955667788',
    estado: 1,
    eliminado: false
  },
  // 1 de Farmacia y Bioquímica (escuelasDB[2])
  {
    id: 4,
    codigo: '2021004',
    escuela: escuelasDB[2],
    numeroDocumento: '44556677',
    nombres: 'Maria',
    primerApellido: 'Gomez',
    segundoApellido: 'Lopez',
    correoInstitucional: 'maria.gomez@unsm.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'FEMENINO',
    telefono: '944556677',
    estado: 0, // Inactiva para probar el filtro
    eliminado: false
  },
  // 1 de Obstetricia (escuelasDB[3])
  {
    id: 5,
    codigo: '2021005',
    escuela: escuelasDB[3],
    numeroDocumento: '55667788',
    nombres: 'Rosa',
    primerApellido: 'Flores',
    segundoApellido: 'Quispe',
    correoInstitucional: 'rosa.flores@unsm.edu.pe',
    generoCodigo: '002002',
    generoDenominacion: 'FEMENINO',
    telefono: '933445566',
    estado: 1,
    eliminado: false
  }
];
let nextEstudianteId = 100;

// =====================================================
// EXPEDIENTES Y TESIS
// =====================================================

// Primero creamos algunos archivos falsos
const archivoProyecto: ExpedienteArchivo = {
  id: 1, nombreArchivo: 'Proyecto_Tesis.pdf', archivoUrl: 'mock/proyecto.pdf', tamanioBytes: 1024000
};

// Definimos los expedientes por separado para que sea más limpio
let expedientesDB: Expediente[] = [
  {
    id: 1,
    tesisId: 'uuid-tesis-1',
    numeroExpediente: 'EXP-2024-001',
    etapaCodigo: '004001', // Proyecto
    etapaDenominacion: 'PROYECTO DE TESIS',
    numRevision: 1,
    fechaAsociacion: '2024-05-10',
    estadoCodigo: '007001', // Registrado
    estadoDenominacion: 'REGISTRADO',
    ultimoPaso: 1,
    comisionId: 1,
    estado: 1,
    archivos: [{ ...archivoProyecto, id: 1 }]
  },
  {
    id: 2,
    tesisId: 'uuid-tesis-2',
    numeroExpediente: 'EXP-2024-002',
    etapaCodigo: '004002', // Borrador
    etapaDenominacion: 'BORRADOR DE TESIS',
    numRevision: 1,
    fechaAsociacion: '2024-06-15',
    estadoCodigo: '007001',
    estadoDenominacion: 'REGISTRADO',
    ultimoPaso: 1,
    comisionId: 1,
    estado: 1,
    archivos: [{ ...archivoProyecto, id: 2, nombreArchivo: 'Borrador_Tesis.pdf' }]
  },
  {
    id: 3,
    tesisId: 'uuid-tesis-3',
    numeroExpediente: 'EXP-2024-003',
    etapaCodigo: '004001',
    etapaDenominacion: 'PROYECTO DE TESIS',
    numRevision: 1,
    fechaAsociacion: '2024-07-20',
    estadoCodigo: '007001',
    estadoDenominacion: 'REGISTRADO',
    ultimoPaso: 1,
    comisionId: 2,
    estado: 1,
    archivos: [{ ...archivoProyecto, id: 3, nombreArchivo: 'Proyecto_Medicina.pdf' }]
  }
];
let nextExpedienteId = 100;
let nextArchivoId = 100;

// Ahora las Tesis, vinculando autores y expedientes
let tesisDB: Tesis[] = [
  {
    id: 'uuid-tesis-1',
    escuelaId: 1,
    escuelaDenominacion: 'Escuela Profesional de Enfermería',
    titulo: 'Factores de riesgo en la hipertensión arterial en adultos mayores',
    estadoCodigo: '003001',
    estadoDenominacion: 'EN TRAMITE',
    fechaRegistro: '2024-05-10T10:00:00',
    autores: [{
      id: 1, tesisId: 'uuid-tesis-1', estudianteId: 1,
      estudianteNombres: 'Ana', estudiantePrimerApellido: 'Torres', estudianteSegundoApellido: 'Vega',
      estudianteDNI: '11223344', estudianteCorreo: 'ana.torres@unsm.edu.pe',
      fechaAsociacion: '2024-05-10', estado: 1
    }],
    expedienteActivo: expedientesDB[0]
  },
  {
    id: 'uuid-tesis-2',
    escuelaId: 1,
    escuelaDenominacion: 'Escuela Profesional de Enfermería',
    titulo: 'Nivel de estrés en el personal de salud durante la pandemia',
    estadoCodigo: '003001',
    estadoDenominacion: 'EN TRAMITE',
    fechaRegistro: '2024-06-15T11:30:00',
    autores: [{
      id: 2, tesisId: 'uuid-tesis-2', estudianteId: 2,
      estudianteNombres: 'Luis', estudiantePrimerApellido: 'Ramirez', estudianteSegundoApellido: 'Soto',
      estudianteDNI: '22334455', estudianteCorreo: 'luis.ramirez@unsm.edu.pe',
      fechaAsociacion: '2024-06-15', estado: 1
    }],
    expedienteActivo: expedientesDB[1]
  },
  {
    id: 'uuid-tesis-3',
    escuelaId: 2,
    escuelaDenominacion: 'Escuela Profesional de Medicina Humana',
    titulo: 'Prevalencia de diabetes mellitus tipo 2 en pacientes ambulatorios',
    estadoCodigo: '003001',
    estadoDenominacion: 'EN TRAMITE',
    fechaRegistro: '2024-07-20T09:00:00',
    autores: [{
      id: 3, tesisId: 'uuid-tesis-3', estudianteId: 3,
      estudianteNombres: 'Carlos', estudiantePrimerApellido: 'Mendoza', estudianteSegundoApellido: 'Paz',
      estudianteDNI: '33445566', estudianteCorreo: 'carlos.mendoza@unsm.edu.pe',
      fechaAsociacion: '2024-07-20', estado: 1
    }],
    expedienteActivo: expedientesDB[2]
  }
];

// =====================================================
// COMISIONES
// =====================================================
let comisionesDB: Comision[] = [
  // Tesis 1: Enfermería (Proyecto)
  {
    id: 1,
    tesisId: 'uuid-tesis-1',
    etapaCodigo: '004001',
    etapaDenominacion: 'PROYECTO DE TESIS',
    fechaConformacion: '2024-05-12',
    estado: 1,
    miembros: [
      {
        id: 1,
        docenteId: 1, // Juan Perez (Enfermería)
        docenteNombre: 'Juan Perez Gomez',
        correoInstitucional: 'juan.perez@unsch.edu.pe',
        rolCodigo: '005001', // PRESIDENTE
        rolDenominacion: 'PRESIDENTE',
        orden: 1,
        fechaAlta: '2024-05-12',
        fechaBaja: '',
        motivoBaja: ''
      },
      {
        id: 2,
        docenteId: 2, // Maria Lopez (Enfermería)
        docenteNombre: 'Maria Lopez Diaz',
        correoInstitucional: 'maria.lopez@unsch.edu.pe',
        rolCodigo: '005004', // ASESOR
        rolDenominacion: 'ASESOR',
        orden: 2,
        fechaAlta: '2024-05-12',
        fechaBaja: '',
        motivoBaja: ''
      }
    ]
  },
  // Tesis 2: Enfermería (Borrador)
  {
    id: 2,
    tesisId: 'uuid-tesis-2',
    etapaCodigo: '004002',
    etapaDenominacion: 'BORRADOR DE TESIS',
    fechaConformacion: '2024-06-18',
    estado: 1,
    miembros: [
      {
        id: 3,
        docenteId: 2, // Maria Lopez (Enfermería)
        docenteNombre: 'Maria Lopez Diaz',
        correoInstitucional: 'maria.lopez@unsch.edu.pe',
        rolCodigo: '005004', // ASESOR
        rolDenominacion: 'ASESOR',
        orden: 1,
        fechaAlta: '2024-06-18',
        fechaBaja: '',
        motivoBaja: ''
      },
      {
        id: 4,
        docenteId: 3, // Carlos Ruiz (Enfermería)
        docenteNombre: 'Carlos Ruiz Soto',
        correoInstitucional: 'carlos.ruiz@unsch.edu.pe',
        rolCodigo: '005002', // MIEMBRO
        rolDenominacion: 'MIEMBRO',
        orden: 2,
        fechaAlta: '2024-06-18',
        fechaBaja: '',
        motivoBaja: ''
      }
    ]
  },
  // Tesis 3: Medicina Humana (Proyecto)
  {
    id: 3,
    tesisId: 'uuid-tesis-3',
    etapaCodigo: '004001',
    etapaDenominacion: 'PROYECTO DE TESIS',
    fechaConformacion: '2024-07-25',
    estado: 1,
    miembros: [
      {
        id: 5,
        docenteId: 5, // Roberto Mendoza (Medicina)
        docenteNombre: 'Roberto Mendoza Quispe',
        correoInstitucional: 'roberto.mendoza@unsch.edu.pe',
        rolCodigo: '005001', // PRESIDENTE
        rolDenominacion: 'PRESIDENTE',
        orden: 1,
        fechaAlta: '2024-07-25',
        fechaBaja: '',
        motivoBaja: ''
      },
      {
        id: 6,
        docenteId: 6, // Elena Vargas (Medicina)
        docenteNombre: 'Elena Vargas Cardenas',
        correoInstitucional: 'elena.vargas@unsch.edu.pe',
        rolCodigo: '005002', // MIEMBRO
        rolDenominacion: 'MIEMBRO',
        orden: 2,
        fechaAlta: '2024-07-25',
        fechaBaja: '',
        motivoBaja: ''
      }
    ]
  }
];
let nextComisionId = 100;
let nextMiembroId = 100;

// =====================================================
// DOCUMENTOS DE TESIS Y ENVÍOS DE CORREO (VACÍOS)
// =====================================================
let documentosDB: DocumentoTesis[] = [];
let nextDocumentoId = 1;

let enviosCorreoDB: EnvioCorreo[] = [];
let nextEnvioId = 1;

export const MOCK_ROUTES: Record<string, MockRoute[]> = {
  // ---------- DEPARTAMENTOS ----------
  departamentos: [
    {
      method: 'GET',
      test: url => /\/departamentos\/listarPorFacultad\/\d+/.test(url),
      handle: () => ({ message: 'OK', data: departamentosDB, status: 'success', code: '200' })
    },
    {
      method: 'GET',
      test: url => /\/departamentos\/listarActivosPorFacultad\/\d+/.test(url),
      handle: () => ({ message: 'OK', data: departamentosDB.filter(d => d.estado === 1), status: 'success', code: '200' })
    },
    {
      method: 'GET',
      test: url => /\/departamentos\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const encontrado = departamentosDB.find(d => d.id === id);
        if (!encontrado) throw { status: 404, message: 'Departamento no encontrado' };
        return { message: 'OK', data: encontrado, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/departamentos/guardar'),
      handle: (req) => {
        const nuevo: DepartamentoAcademico = {
          id: nextDepartamentoId++,
          estado: 1,
          totalEscuelas: 0,
          facultadId: 1,
          ...req.body
        };
        departamentosDB.push(nuevo);
        return { message: 'Departamento creado correctamente', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => url.endsWith('/departamentos/editar'),
      handle: (req) => {
        const idx = departamentosDB.findIndex(d => d.id === req.body.id);
        if (idx === -1) throw { status: 404, message: 'Departamento no encontrado' };
        departamentosDB[idx] = { ...departamentosDB[idx], ...req.body };
        return { message: 'Departamento actualizado', data: departamentosDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/departamentos\/activar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const dept = departamentosDB.find(d => d.id === id);
        if (dept) dept.estado = 1;
        return { message: 'Activado', data: dept, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/departamentos\/desactivar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const dept = departamentosDB.find(d => d.id === id);
        if (dept) dept.estado = 0;
        return { message: 'Desactivado', data: dept, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/departamentos\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = departamentosDB.findIndex(d => d.id === id);
        if (idx !== -1) departamentosDB.splice(idx, 1);
        return { message: 'Eliminado', data: null, status: 'success', code: '200' };
      }
    },

  ],
  // ---------- ESCUELAS ----------
  escuelas: [
    {
      method: 'GET',
      test: url => /\/escuelas\/listarPorFacultad\/\d+/.test(url),
      handle: () => ({ message: 'Lista de escuelas', data: escuelasDB, status: 'success', code: '200' })
    },
    {
      method: 'GET',
      test: url => /\/escuelas\/listarActivosPorFacultad\/\d+/.test(url),
      handle: () => ({ message: 'Lista de escuelas activas', data: escuelasDB.filter(e => e.estado === 1), status: 'success', code: '200' })
    },
    {
      method: 'GET',
      test: url => /\/escuelas\/listarPorDepartamento\/\d+/.test(url),
      handle: (req) => {
        const deptoId = Number(req.url.split('/').pop());
        return {
          message: 'Lista de escuelas por departamento',
          data: escuelasDB.filter(e => e.departamento.id === deptoId),
          status: 'success', code: '200'
        };
      }
    },
    {
      method: 'GET',
      test: url => /\/escuelas\/plantillas\/descargar/.test(url),
      handle: () => {
        return new Blob(['Contenido de prueba de la plantilla'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      }
    },
    {
      method: 'GET',
      test: url => /\/escuelas\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const encontrado = escuelasDB.find(e => e.id === id);
        if (!encontrado) throw { status: 404, message: 'Escuela no encontrada' };
        return { message: 'OK', data: encontrado, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/escuelas'),
      handle: (req) => {
        // Buscamos el objeto completo del departamento usando el ID que envía el frontend
        const depto = departamentosDB.find(d => d.id === req.body.departamentoId);

        const nueva: EscuelaProfesional = {
          id: nextEscuelaId++,
          estado: 1,
          departamento: depto!, // Usamos el objeto completo
          codigo: req.body.codigo,
          abreviatura: req.body.abreviatura,
          denominacion: req.body.denominacion
        };
        escuelasDB.push(nueva);
        return { message: 'Escuela creada correctamente', data: nueva, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => url.endsWith('/escuelas'),
      handle: (req) => {
        const idx = escuelasDB.findIndex(e => e.id === req.body.id);
        if (idx === -1) throw { status: 404, message: 'Escuela no encontrada' };

        // Buscamos si cambió de departamento
        const depto = departamentosDB.find(d => d.id === req.body.departamentoId);

        escuelasDB[idx] = {
          ...escuelasDB[idx],
          departamento: depto!, // Actualizamos al objeto completo
          codigo: req.body.codigo,
          abreviatura: req.body.abreviatura,
          denominacion: req.body.denominacion
        };
        return { message: 'Escuela actualizada', data: escuelasDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/escuelas\/activar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const esc = escuelasDB.find(e => e.id === id);
        if (esc) esc.estado = 1;
        return { message: 'Escuela activada', data: esc, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/escuelas\/desactivar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const esc = escuelasDB.find(e => e.id === id);
        if (esc) esc.estado = 0;
        return { message: 'Escuela desactivada', data: esc, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/escuelas\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = escuelasDB.findIndex(e => e.id === id);
        if (idx !== -1) escuelasDB.splice(idx, 1);
        return { message: 'Escuela eliminada', data: null, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- PLANTILLAS DE DOCUMENTO ----------
  plantilla: [
    {
      method: 'GET',
      test: url => /\/plantilla\/escuela\/\d+$/.test(url),
      handle: (req) => {
        const escuelaId = Number(req.url.split('/').pop());
        const filtradas = plantillasDB.filter(p => p.escuelaId === escuelaId);
        return { message: 'Lista de plantillas', data: filtradas, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/plantilla\/escuela\/\d+\/tipo\/[A-Z0-9]+/.test(url),
      handle: (req) => {
        const partes = req.url.split('/');
        const escuelaId = Number(partes[partes.length - 3]);
        const tipoCodigo = partes[partes.length - 1];

        const encontrada = plantillasDB.find(p => p.escuelaId === escuelaId && p.tipoDocumentoCodigo === tipoCodigo);
        if (!encontrada) throw { status: 404, message: 'Plantilla no encontrada' };
        return { message: 'OK', data: encontrada, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/plantilla'),
      handle: (req) => {
        const formData = req.body as FormData;
        const escuelaId = Number(formData.get('escuelaId'));
        const tipoCodigo = formData.get('tipoDocumentoCodigo') as string;
        const plazoDiasStr = formData.get('plazoDias');
        const plazoMesesStr = formData.get('plazoMeses');
        const file = formData.get('archivoDocx') as File;

        const nueva: PlantillaDocumento = {
          id: nextPlantillaId++,
          escuelaId,
          tipoDocumentoCodigo: tipoCodigo,
          tipoDocumentoDenominacion: TIPOS_DOCUMENTO_MAP[tipoCodigo] || 'Tipo Desconocido',
          nombreDocumento: file ? file.name : 'documento.docx',
          archivoUrl: `mock/archivo-${nextPlantillaId}.docx`,
          plazoDias: plazoDiasStr ? Number(plazoDiasStr) : null,
          plazoMeses: plazoMesesStr ? Number(plazoMesesStr) : null,
          estado: 1
        };

        plantillasDB.push(nueva);
        return { message: 'Plantilla registrada', data: nueva, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/plantilla\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const formData = req.body as FormData;
        const idx = plantillasDB.findIndex(p => p.id === id);

        if (idx === -1) throw { status: 404, message: 'Plantilla no encontrada' };

        const plazoDiasStr = formData.get('plazoDias');
        const plazoMesesStr = formData.get('plazoMeses');
        const file = formData.get('archivoDocx') as File;

        // Actualizamos solo los campos que vienen en el FormData
        plantillasDB[idx] = {
          ...plantillasDB[idx],
          plazoDias: plazoDiasStr ? Number(plazoDiasStr) : null,
          plazoMeses: plazoMesesStr ? Number(plazoMesesStr) : null,
          ...(file && {
            nombreDocumento: file.name,
            archivoUrl: `mock/archivo-updated-${Date.now()}.docx`
          })
        };

        return { message: 'Plantilla actualizada', data: plantillasDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/plantilla\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = plantillasDB.findIndex(p => p.id === id);
        if (idx !== -1) plantillasDB.splice(idx, 1);
        return { message: 'Plantilla eliminada', data: null, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- DOCENTES ----------
  docentes: [
    {
      method: 'POST',
      test: url => url.includes('/docentes/filtrar'),
      handle: (req) => {
        // 1. Extraer paginación de los query params
        const urlObj = new URL(req.url, 'http://localhost');
        const page = Number(urlObj.searchParams.get('page') || 0);
        const size = Number(urlObj.searchParams.get('size') || 10);

        // 2. Extraer filtros del body
        const filtro = req.body as DocenteFiltro;

        // 3. Filtrar (igual que antes)
        let filtrados = docentesDB.filter(d => !d.eliminado);

        if (filtro.correo) {
          const search = filtro.correo.toLowerCase();
          filtrados = filtrados.filter(d =>
            d.correoInstitucional.toLowerCase().includes(search)
          );
        }
        if (filtro.estado !== undefined && filtro.estado !== null) {
          filtrados = filtrados.filter(d => d.estado === filtro.estado);
        }
        if (filtro.escuelaId) {
          filtrados = filtrados.filter(d => d.escuela.id === filtro.escuelaId);
        }
        if (filtro.departamentoAcademicoId) {
          filtrados = filtrados.filter(d => d.departamento.id === filtro.departamentoAcademicoId);
        }
        if (filtro.numeroDocumento) {
          filtrados = filtrados.filter(d => d.numeroDocumento === filtro.numeroDocumento);
        }

        // 4. Calcular metadatos de paginación
        const totalItems = filtrados.length;
        const totalPages = Math.ceil(totalItems / size) || 1; // Si está vacío, forzamos 1 página
        const startIndex = page * size;
        const paginatedData = filtrados.slice(startIndex, startIndex + size);

        // 5. Retornar con la estructura exacta de PaginatedResponseDTO
        return {
          data: paginatedData,
          totalItems: totalItems,
          totalPages: totalPages,
          currentPage: page,
          size: size,
          isFirst: page === 0,
          isLast: page === totalPages - 1 || totalItems === 0,
          message: 'Lista de docentes paginada',
          status: 'success',
          code: '200'
        };
      }
    },
    {
      method: 'GET',
      test: url => /\/docentes\/metricas\/\d+/.test(url),
      handle: () => {
        const activos = docentesDB.filter(d => d.estado === 1 && !d.eliminado).length;
        const total = docentesDB.filter(d => !d.eliminado).length;
        const inactivos = total - activos;

        return {
          message: 'Métricas de docentes',
          data: {
            total,
            totalActivos: activos,
            porcentajeActivos: total > 0 ? (activos / total) * 100 : 0,
            totalInactivos: inactivos,
            porcentajeInactivos: total > 0 ? (inactivos / total) * 100 : 0
          },
          status: 'success', code: '200'
        };
      }
    },
    {
      method: 'GET',
      test: url => url.includes('/docentes/obtenerPorNumDocumento'),
      handle: (req) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const numDoc = urlObj.searchParams.get('numeroDocumento');

        const docente = docentesDB.find(d => d.numeroDocumento === numDoc && !d.eliminado);
        if (!docente) throw { status: 404, message: 'Docente no encontrado' };

        return { message: 'OK', data: docente, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/docentes'),
      handle: (req) => {
        const body = req.body as DocenteRequest;

        // Mapear relaciones
        const escuela = escuelasDB.find(e => e.id === body.escuelaId) || escuelasDB[0];
        const depto = departamentosDB.find(d => d.id === body.departamentoAcademicoId) || departamentosDB[0];

        const nuevo: Docente = {
          id: nextDocenteId++,
          codigo: body.codigo || `DOC${nextDocenteId}`,
          escuela,
          departamento: depto,
          tipoDocumentoCodigo: body.tipoDocumentoCodigo,
          tipoDocumentoDenominacion: body.tipoDocumentoCodigo === '001001' ? 'DNI' : 'Pasaporte',
          numeroDocumento: body.numeroDocumento,
          nombres: body.nombres,
          primerApellido: body.primerApellido,
          segundoApellido: body.segundoApellido,
          correoInstitucional: body.correoInstitucional,
          generoCodigo: body.generoCodigo,
          generoDenominacion: body.generoCodigo === '002001' ? 'Masculino' : 'Femenino',
          telefono: body.telefono,
          estado: 1,
          eliminado: false,
          fullName: `${body.nombres} ${body.primerApellido} ${body.segundoApellido}`
        };

        docentesDB.push(nuevo);
        return { message: 'Docente creado correctamente', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/docentes\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const docente = docentesDB.find(d => d.id === id && !d.eliminado);
        if (!docente) throw { status: 404, message: 'Docente no encontrado' };
        return { message: 'OK', data: docente, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/docentes\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = docentesDB.findIndex(d => d.id === id);
        if (idx === -1) throw { status: 404, message: 'Docente no encontrado' };

        const body = req.body as DocenteRequest;
        const escuela = escuelasDB.find(e => e.id === body.escuelaId) || docentesDB[idx].escuela;
        const depto = departamentosDB.find(d => d.id === body.departamentoAcademicoId) || docentesDB[idx].departamento;

        docentesDB[idx] = {
          ...docentesDB[idx],
          ...body,
          escuela,
          departamento: depto,
          fullName: `${body.nombres} ${body.primerApellido} ${body.segundoApellido}`
        };

        return { message: 'Docente actualizado correctamente', data: docentesDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/docentes\/activar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const docente = docentesDB.find(d => d.id === id);
        if (docente) docente.estado = 1;
        return { message: 'Docente activado', data: docente, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/docentes\/desactivar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const docente = docentesDB.find(d => d.id === id);
        if (docente) docente.estado = 0;
        return { message: 'Docente desactivado', data: docente, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/docentes\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const docente = docentesDB.find(d => d.id === id);
        if (docente) docente.eliminado = true; // Soft delete como suele hacer Spring
        return { message: 'Docente eliminado', data: null, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- TABLAS MAESTRAS ----------
  maestros: [
    {
      method: 'GET',
      test: url => url.includes('/maestros/getTables'),
      handle: (req) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const isSystem = urlObj.searchParams.get('isSystem') === 'true';

        // Solo devolvemos los agrupadores (itemCode === '000')
        const tablas = maestrosDB.filter(m => m.itemCode === '000' && m.isSystem === isSystem);
        return { message: 'Lista de tablas', data: tablas, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/maestros\/getItems\/[0-9A-Z]+/.test(url),
      handle: (req) => {
        const tableCode = req.url.split('/').pop();
        const items = maestrosDB.filter(m => m.tableCode === tableCode && m.itemCode !== '000');
        return { message: 'Lista de ítems', data: items, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/maestros\/getItemsActives\/[0-9A-Z]+/.test(url),
      handle: (req) => {
        const tableCode = req.url.split('/').pop();
        const items = maestrosDB.filter(m => m.tableCode === tableCode && m.itemCode !== '000' && m.state === 1);
        return { message: 'Lista de ítems activos', data: items, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/maestros'),
      handle: (req) => {
        const body = req.body as MasterTableRequest;

        // Generamos el código uniendo la tabla y el ítem
        const codigoGenerado = `${body.tableCode}${body.itemCode}`;

        const nuevo: MasterTable = {
          id: nextMaestroId++,
          tableCode: body.tableCode,
          itemCode: body.itemCode,
          code: codigoGenerado,
          denomination: body.denomination,
          isSystem: body.isSystem,
          state: 1 // Nace activo
        };

        maestrosDB.push(nuevo);
        return { message: 'Maestro creado', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/maestros\/[0-9A-Z]+$/.test(url) && !url.includes('activate') && !url.includes('deactivate'),
      handle: (req) => {
        const code = req.url.split('/').pop();
        const idx = maestrosDB.findIndex(m => m.code === code);

        if (idx === -1) throw { status: 404, message: 'Maestro no encontrado' };

        const body = req.body as MasterTableRequest;
        maestrosDB[idx] = {
          ...maestrosDB[idx],
          denomination: body.denomination,
          isSystem: body.isSystem
        };
        return { message: 'Maestro actualizado', data: maestrosDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/maestros\/activate\/[0-9A-Z]+/.test(url),
      handle: (req) => {
        const code = req.url.split('/').pop();
        const maestro = maestrosDB.find(m => m.code === code);
        if (maestro) maestro.state = 1;
        return { message: 'Maestro activado', data: maestro, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/maestros\/deactivate\/[0-9A-Z]+/.test(url),
      handle: (req) => {
        const code = req.url.split('/').pop();
        const maestro = maestrosDB.find(m => m.code === code);
        if (maestro) maestro.state = 0;
        return { message: 'Maestro desactivado', data: maestro, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/maestros\/[0-9A-Z]+$/.test(url),
      handle: (req) => {
        const code = req.url.split('/').pop();
        const idx = maestrosDB.findIndex(m => m.code === code);
        if (idx !== -1) maestrosDB.splice(idx, 1);
        return { message: 'Maestro eliminado', data: null, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- ESTUDIANTES ----------
  estudiantes: [
    {
      method: 'POST',
      test: url => url.includes('/estudiantes/filtrar'),
      handle: (req) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const page = Number(urlObj.searchParams.get('page') || 0);
        const size = Number(urlObj.searchParams.get('size') || 10);
        const filtro = req.body as EstudianteFiltro;

        // Filtro base (no eliminados)
        let filtrados = estudiantesDB.filter(e => !e.eliminado);

        // Filtros solicitados
        if (filtro.escuelaId) {
          filtrados = filtrados.filter(e => e.escuela.id === filtro.escuelaId);
        }
        if (filtro.codigo) {
          filtrados = filtrados.filter(e => e.codigo.toLowerCase().includes(filtro.codigo!.toLowerCase()));
        }
        if (filtro.numeroDocumento) {
          filtrados = filtrados.filter(e => e.numeroDocumento.includes(filtro.numeroDocumento!));
        }
        if (filtro.nombre) {
          const search = filtro.nombre.toLowerCase();
          filtrados = filtrados.filter(e =>
            e.nombres.toLowerCase().includes(search) ||
            e.primerApellido.toLowerCase().includes(search) ||
            e.segundoApellido.toLowerCase().includes(search) ||
            `${e.nombres} ${e.primerApellido} ${e.segundoApellido}`.toLowerCase().includes(search)
          );
        }
        if (filtro.email) {
          filtrados = filtrados.filter(e => e.correoInstitucional.toLowerCase().includes(filtro.email!.toLowerCase()));
        }
        if (filtro.generoCodigo) {
          filtrados = filtrados.filter(e => e.generoCodigo === filtro.generoCodigo);
        }

        // Paginación
        const totalItems = filtrados.length;
        const totalPages = Math.ceil(totalItems / size) || 1;
        const startIndex = page * size;
        const paginatedData = filtrados.slice(startIndex, startIndex + size);

        return {
          data: paginatedData,
          totalItems,
          totalPages,
          currentPage: page,
          size,
          isFirst: page === 0,
          isLast: page === totalPages - 1 || totalItems === 0,
          message: 'Lista de estudiantes paginada',
          status: 'success',
          code: '200'
        };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/estudiantes'),
      handle: (req) => {
        const body = req.body as EstudianteRequest;
        const escuela = escuelasDB.find(e => e.id === body.escuelaId) || escuelasDB[0];

        const nuevo: Estudiante = {
          id: nextEstudianteId++,
          codigo: body.codigo || `EST${nextEstudianteId}`,
          escuela: escuela,
          numeroDocumento: body.numeroDocumento || '',
          nombres: body.nombres,
          primerApellido: body.primerApellido,
          segundoApellido: body.segundoApellido,
          correoInstitucional: body.correoInstitucional,
          generoCodigo: body.generoCodigo,
          generoDenominacion: body.generoCodigo === '002001' ? 'MASCULINO' : 'FEMENINO',
          telefono: body.telefono,
          estado: 1,
          eliminado: false
        };
        estudiantesDB.push(nuevo);
        return { message: 'Estudiante creado correctamente', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/estudiantes\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const estudiante = estudiantesDB.find(e => e.id === id && !e.eliminado);
        if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };
        return { message: 'OK', data: estudiante, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/estudiantes\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = estudiantesDB.findIndex(e => e.id === id);
        if (idx === -1) throw { status: 404, message: 'Estudiante no encontrado' };

        const body = req.body as EstudianteRequest;
        const escuela = escuelasDB.find(e => e.id === body.escuelaId) || estudiantesDB[idx].escuela;

        estudiantesDB[idx] = {
          ...estudiantesDB[idx],
          ...body,
          escuela: escuela
        };
        return { message: 'Estudiante actualizado', data: estudiantesDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/estudiantes\/activar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const est = estudiantesDB.find(e => e.id === id);
        if (est) est.estado = 1;
        return { message: 'Estudiante activado', data: est, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/estudiantes\/desactivar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const est = estudiantesDB.find(e => e.id === id);
        if (est) est.estado = 0;
        return { message: 'Estudiante desactivado', data: est, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/estudiantes\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = estudiantesDB.findIndex(e => e.id === id);
        if (idx !== -1) estudiantesDB[idx].eliminado = true; // Soft delete
        return { message: 'Estudiante eliminado', data: null, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- COMISIONES ----------
  comision: [
    {
      method: 'POST',
      test: url => url.endsWith('/comision'),
      handle: (req) => {
        const body = req.body as ComisionRequest;
        const nueva: Comision = {
          id: nextComisionId++,
          tesisId: body.tesisId,
          etapaCodigo: body.etapaCodigo,
          etapaDenominacion: body.etapaCodigo === '004002' ? 'BORRADOR DE TESIS' : 'PROYECTO DE TESIS',
          fechaConformacion: body.fechaConformacion || new Date().toISOString().split('T')[0],
          estado: 1,
          miembros: []
        };
        comisionesDB.push(nueva);
        return { message: 'Comisión registrada', data: nueva, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/comision/registrarMiembro'),
      handle: (req) => {
        const body = req.body as ComisionMiembroRequest;
        const comision = comisionesDB.find(c => c.id === body.comisionId);
        if (!comision) throw { status: 404, message: 'Comisión no encontrada' };

        const docente = docentesDB.find(d => d.id === body.docenteId);
        if (!docente) throw { status: 404, message: 'Docente no encontrado' };

        // Mapeo de roles para que se vea bonito en la vista
        let rolDen = 'MIEMBRO';
        if (body.rolCodigo === '005001') rolDen = 'PRESIDENTE';
        else if (body.rolCodigo === '005004') rolDen = 'ASESOR';
        else if (body.rolCodigo === '005003') rolDen = 'COASESOR';

        const nuevoMiembro: ComisionMiembro = {
          id: nextMiembroId++,
          docenteId: docente.id,
          docenteNombre: `${docente.nombres} ${docente.primerApellido} ${docente.segundoApellido}`,
          correoInstitucional: docente.correoInstitucional,
          rolCodigo: body.rolCodigo,
          rolDenominacion: rolDen,
          orden: body.orden || 1,
          fechaAlta: new Date().toISOString().split('T')[0],
          fechaBaja: '',
          motivoBaja: ''
        };

        comision.miembros.push(nuevoMiembro);
        return { message: 'Miembro registrado en la comisión', data: nuevoMiembro, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.includes('/comision/miembro/actualizarRol/'),
      handle: (req) => {
        // Formato: /comision/miembro/actualizarRol/{id}/{rol}
        const partes = req.url.split('/');
        const id = Number(partes[partes.length - 2]);
        const rol = partes[partes.length - 1];

        let encontrado: ComisionMiembro | null = null;
        for (const c of comisionesDB) {
          const m = c.miembros.find(m => m.id === id);
          if (m) { encontrado = m; break; }
        }

        if (encontrado) {
          encontrado.rolCodigo = rol;
          encontrado.rolDenominacion = rol === '005001' ? 'PRESIDENTE' : (rol === '005004' ? 'ASESOR' : 'MIEMBRO');
        }
        return { message: 'Rol actualizado', data: encontrado, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/comision\/miembro\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        for (const c of comisionesDB) {
          const idx = c.miembros.findIndex(m => m.id === id);
          if (idx !== -1) {
            c.miembros.splice(idx, 1);
            break;
          }
        }
        return { message: 'Miembro eliminado', data: null, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/comision\/listarPorTesis\/[a-zA-Z0-9-]+$/.test(url),
      handle: (req) => {
        const tesisId = req.url.split('/').pop();
        const filtradas = comisionesDB.filter(c => c.tesisId === tesisId && c.estado === 1);
        return { message: 'OK', data: filtradas, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/comision\/[a-zA-Z0-9-]+\/[0-9A-Z]+$/.test(url),
      handle: (req) => {
        // Formato: /comision/{tesisId}/{etapa}
        const partes = req.url.split('/');
        const tesisId = partes[partes.length - 2];
        const etapa = partes[partes.length - 1];

        const comision = comisionesDB.find(c => c.tesisId === tesisId && c.etapaCodigo === etapa);
        if (!comision) throw { status: 404, message: 'Comisión no encontrada para esta etapa' };
        return { message: 'OK', data: comision, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/comision\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const comision = comisionesDB.find(c => c.id === id);
        if (!comision) throw { status: 404, message: 'Comisión no encontrada' };
        return { message: 'OK', data: comision, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- LISTADOS DE DOCUMENTOS ----------
  documento: [
    {
      method: 'GET',
      test: url => /\/documento\/tesis\/[a-zA-Z0-9-]+$/.test(url),
      handle: (req) => {
        const tesisId = req.url.split('/').pop();
        const expIds = expedientesDB.filter(e => e.tesisId === tesisId).map(e => e.id);
        const docs = documentosDB.filter(d => expIds.includes(d.expedienteTesisId));
        return { message: 'OK', data: docs, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/documento\/expediente\/\d+\/tipo\/[0-9A-Z]+/.test(url),
      handle: (req) => {
        const partes = req.url.split('/');
        const expId = Number(partes[partes.length - 3]);
        const tipo = partes[partes.length - 1];
        const docs = documentosDB.filter(d => d.expedienteTesisId === expId && d.tipoDocumentoCodigo === tipo);
        return { message: 'OK', data: docs, status: 'success', code: '200' };
      }
    },



    // ---------- MEMORANDOS ----------
    {
      method: 'POST',
      test: url => url.endsWith('/documento/memo'),
      handle: (req) => {
        const body = req.body as GenerarMemoRequest;
        const nuevo: DocumentoTesis = {
          id: nextDocumentoId++,
          expedienteTesisId: body.expedienteId,
          tipoDocumentoCodigo: '006001',
          tipoDocumentoDenominacion: 'MEMORANDO DE PROYECTO',
          numeroCorrelativo: body.numeroCorrelativo,
          anioCorrelativo: body.anio,
          numeroCompleto: `MEM-${body.numeroCorrelativo}-${body.anio}`,
          fechaEmision: new Date().toISOString().split('T')[0],
          archivoWordUrl: `mock/memo-${body.numeroCorrelativo}.docx`,
          archivoPdfUrl: `mock/memo-${body.numeroCorrelativo}.pdf`,
          tamanioBytesWord: 20480,
          tamanioBytesPdf: 102400,
          resultadoCodigo: '', resultadoDenominacion: '', observaciones: '',
          estadoCodigo: '009001', estadoDenominacion: 'GENERADO'
        };
        documentosDB.push(nuevo);
        return { message: 'Memo generado', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/documento\/expediente\/obtenerMemorando\/\d+/.test(url),
      handle: (req) => {
        const expId = Number(req.url.split('/').pop());
        const doc = documentosDB.find(d => d.expedienteTesisId === expId && (d.tipoDocumentoCodigo === '006001' || d.tipoDocumentoCodigo === '006002'));
        if (!doc) throw { status: 404, message: 'Memorando no encontrado' };
        return { message: 'OK', data: doc, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/documento\/memo\/\d+\/regenerar/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/')[req.url.split('/').length - 2]);
        const doc = documentosDB.find(d => d.id === id);
        if (doc) doc.estadoDenominacion = 'REGENERADO';
        return { message: 'Memo regenerado', data: doc, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/documento\/memo\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = documentosDB.findIndex(d => d.id === id);
        if (idx !== -1) documentosDB.splice(idx, 1);
        return { message: 'Memo eliminado', data: null, status: 'success', code: '200' };
      }
    },

    // ---------- RESOLUCIONES ----------
    {
      method: 'POST',
      test: url => url.endsWith('/documento/resolucion-aprobacion-proyecto'),
      handle: (req) => {
        const body = req.body as GenerarResolucionProyectoRequest;
        const nuevo: DocumentoTesis = {
          id: nextDocumentoId++,
          expedienteTesisId: body.expedienteId,
          tipoDocumentoCodigo: '006005',
          tipoDocumentoDenominacion: 'RESOLUCIÓN DE APROBACIÓN DE PROYECTO',
          numeroCorrelativo: body.numeroResolucion,
          anioCorrelativo: body.anioResolucion,
          numeroCompleto: `RES-${body.numeroResolucion}-${body.anioResolucion}`,
          fechaEmision: new Date().toISOString().split('T')[0],
          archivoWordUrl: `mock/res-${body.numeroResolucion}.docx`,
          archivoPdfUrl: `mock/res-${body.numeroResolucion}.pdf`,
          tamanioBytesWord: 30720, tamanioBytesPdf: 153600,
          resultadoCodigo: '', resultadoDenominacion: '', observaciones: '',
          estadoCodigo: '009001', estadoDenominacion: 'GENERADO'
        };
        documentosDB.push(nuevo);
        return { message: 'Resolución generada', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/documento\/resolucion-aprobacion-proyecto\/expediente\/\d+/.test(url),
      handle: (req) => {
        const expId = Number(req.url.split('/').pop());
        const doc = documentosDB.find(d => d.expedienteTesisId === expId && d.tipoDocumentoCodigo === '006005');
        if (!doc) throw { status: 404, message: 'Resolución no encontrada' };
        return { message: 'OK', data: doc, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/documento\/resolucion-aprobacion-proyecto\/\d+\/regenerar/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/')[req.url.split('/').length - 2]);
        const doc = documentosDB.find(d => d.id === id);
        if (doc) doc.estadoDenominacion = 'REGENERADO';
        return { message: 'Resolución regenerada', data: doc, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/documento\/resolucion-aprobacion-proyecto\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = documentosDB.findIndex(d => d.id === id);
        if (idx !== -1) documentosDB.splice(idx, 1);
        return { message: 'Resolución eliminada', data: null, status: 'success', code: '200' };
      }
    },

    // ---------- DICTÁMENES ----------
    {
      method: 'POST',
      test: url => url.endsWith('/documento/dictamen'),
      handle: (req) => {
        const formData = req.body as FormData;
        const expId = Number(formData.get('expedienteId'));
        const resultCode = formData.get('resultadoCodigo') as string;

        const nuevo: DocumentoTesis = {
          id: nextDocumentoId++,
          expedienteTesisId: expId,
          tipoDocumentoCodigo: '006004',
          tipoDocumentoDenominacion: 'DICTAMEN',
          numeroCorrelativo: 0, anioCorrelativo: new Date().getFullYear(),
          numeroCompleto: `DICTAMEN-EXP-${expId}`,
          fechaEmision: formData.get('fechaEmision') as string || new Date().toISOString().split('T')[0],
          archivoWordUrl: 'mock/dictamen.docx', archivoPdfUrl: 'mock/dictamen.pdf',
          tamanioBytesWord: 10240, tamanioBytesPdf: 51200,
          resultadoCodigo: resultCode,
          resultadoDenominacion: resultCode === '008001' ? 'DICTAMEN APROBADO' : 'DICTAMEN OBSERVADO',
          observaciones: formData.get('observaciones') as string || '',
          estadoCodigo: '009001', estadoDenominacion: 'GENERADO'
        };
        documentosDB.push(nuevo);
        return { message: 'Dictamen registrado', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => url.includes('/documento/dictamen/expediente/'),
      handle: (req) => {
        console.log('¡Entró al handler de dictamen!', req.url);
        const expId = Number(req.url.split('/').pop());
        const doc = documentosDB.find(d => d.expedienteTesisId === expId && d.tipoDocumentoCodigo === '006004');

        if (!doc) throw { status: 404, message: 'Dictamen no encontrado' };
        return { message: 'OK', data: doc, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/documento\/dictamen\/expediente\/\d+/.test(url),
      handle: (req) => {
        const expId = Number(req.url.split('/').pop());
        const idx = documentosDB.findIndex(d => d.expedienteTesisId === expId && d.tipoDocumentoCodigo === '006004');
        if (idx !== -1) documentosDB.splice(idx, 1);
        return { message: 'Dictamen eliminado', data: null, status: 'success', code: '200' };
      }
    },

    // ---------- ENVÍO DE CORREOS ----------
    {
      method: 'GET',
      test: url => /\/documento\/contenidoEnviarMemo\/\d+/.test(url),
      handle: (req) => {
        const expId = Number(req.url.split('/').pop());
        const exp = expedientesDB.find(e => e.id === expId);
        const doc = documentosDB.find(d => d.expedienteTesisId === expId && d.tipoDocumentoCodigo.startsWith('00600'));

        return {
          message: 'OK',
          data: {
            documentoId: doc ? doc.id : 1,
            destinatarios: [
              { email: 'juan.perez@unsch.edu.pe', nombre: 'Juan Perez Gomez', rol: 'PRESIDENTE' },
              { email: 'maria.lopez@unsch.edu.pe', nombre: 'Maria Lopez Diaz', rol: 'MIEMBRO' }
            ],
            asunto: `Envío de Memorando - ${exp?.numeroExpediente || 'Expediente'}`,
            cuerpo: `Estimados miembros,\n\nAdjunto el memorando del expediente ${exp?.numeroExpediente}.\n\nAtentamente,\nCoordinación.`,
            archivos: [{ id: 1, nombreArchivo: 'memo.pdf', archivoUrl: 'mock/memo.pdf', tamanioBytes: 102400 }]
          },
          status: 'success', code: '200'
        };
      }
    },
    {
      method: 'GET',
      test: url => /\/documento\/contenidoEnviarResolucion\/\d+/.test(url),
      handle: (req) => {
        const docId = Number(req.url.split('/').pop());
        return {
          message: 'OK',
          data: {
            documentoId: docId,
            destinatarios: [{ email: 'juan.perez@unsch.edu.pe', nombre: 'Juan Perez Gomez', rol: 'PRESIDENTE' }],
            asunto: `Resolución de Aprobación de Proyecto`,
            cuerpo: `Estimado docente,\n\nAdjunto la resolución de aprobación.\n\nSaludos.`,
            archivos: [{ id: 2, nombreArchivo: 'resolucion.pdf', archivoUrl: 'mock/resolucion.pdf', tamanioBytes: 153600 }]
          },
          status: 'success', code: '200'
        };
      }
    },
    {
      method: 'POST',
      test: url => /\/documento\/\d+\/enviar$/.test(url),
      handle: (req) => {
        const docId = Number(req.url.split('/')[req.url.split('/').length - 2]);
        const doc = documentosDB.find(d => d.id === docId);
        if (doc) doc.estadoDenominacion = 'ENVIADO';

        enviosCorreoDB.push({
          id: nextEnvioId++, documentoTesisId: docId, asunto: 'Memorando enviado',
          destinatarios: [], adjuntos: [], fechaEnvio: new Date().toISOString(), estado: 'ENVIADO'
        });

        return { message: 'Memo enviado por correo', data: doc, status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => /\/documento\/\d+\/enviarResolucionProyecto$/.test(url),
      handle: (req) => {
        const docId = Number(req.url.split('/')[req.url.split('/').length - 2]);
        const doc = documentosDB.find(d => d.id === docId);
        if (doc) doc.estadoDenominacion = 'ENVIADO';

        enviosCorreoDB.push({
          id: nextEnvioId++, documentoTesisId: docId, asunto: 'Resolución enviada',
          destinatarios: [], adjuntos: [], fechaEnvio: new Date().toISOString(), estado: 'ENVIADO'
        });

        return { message: 'Resolución enviada por correo', data: doc, status: 'success', code: '200' };
      }
    },
  ],

  envio_correo: [
    {
      method: 'GET',
      test: url => url.includes('/envio_correo/historial/'),
      handle: (req) => {
        const docId = Number(req.url.split('/').pop());
        const historial = enviosCorreoDB.filter(e => e.documentoTesisId === docId);
        return { message: 'Historial de envíos', data: historial, status: 'success', code: '200' };
      }
    }
  ],

  // ---------- TESIS ----------
  tesis: [
    {
      method: 'POST',
      test: url => url.includes('/tesis/filtrar'),
      handle: (req) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const page = Number(urlObj.searchParams.get('page') || 0);
        const size = Number(urlObj.searchParams.get('size') || 10);
        const filtro = req.body as TesisFiltro;

        let filtradas = tesisDB.filter(t => !(t as any).eliminado);

        if (filtro.escuelaId) {
          filtradas = filtradas.filter(t => t.escuelaId === filtro.escuelaId);
        }
        if (filtro.estadoCodigo) {
          filtradas = filtradas.filter(t => t.estadoCodigo === filtro.estadoCodigo);
        }
        if (filtro.textoBusqueda) {
          const search = filtro.textoBusqueda.toLowerCase();
          filtradas = filtradas.filter(t =>
            t.titulo.toLowerCase().includes(search) ||
            t.autores.some(a => a.estudianteNombres.toLowerCase().includes(search) || a.estudiantePrimerApellido.toLowerCase().includes(search))
          );
        }

        const totalItems = filtradas.length;
        const totalPages = Math.ceil(totalItems / size) || 1;
        const paginatedData = filtradas.slice(page * size, (page + 1) * size);

        return {
          data: paginatedData, totalItems, totalPages, currentPage: page, size,
          isFirst: page === 0, isLast: page === totalPages - 1 || totalItems === 0,
          message: 'Lista de tesis', status: 'success', code: '200'
        };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/tesis'),
      handle: (req) => {
        const formData = req.body as FormData;
        const escuelaId = Number(formData.get('escuelaId'));
        const escuela = escuelasDB.find(e => e.id === escuelaId) || escuelasDB[0];

        const nuevaTesisId = `uuid-tesis-${Date.now()}`;

        // Crear Expediente automáticamente
        const nuevoExpediente: Expediente = {
          id: nextExpedienteId++,
          tesisId: nuevaTesisId,
          numeroExpediente: formData.get('numeroExpediente') as string,
          etapaCodigo: formData.get('etapaTesisCodigo') as string || '004001',
          etapaDenominacion: formData.get('etapaTesisCodigo') === '004002' ? 'BORRADOR DE TESIS' : 'PROYECTO DE TESIS',
          numRevision: Number(formData.get('numeroRevision') || 1),
          fechaAsociacion: new Date().toISOString().split('T')[0],
          estadoCodigo: '007001',
          estadoDenominacion: 'REGISTRADO',
          ultimoPaso: 1,
          comisionId: 1,
          estado: 1,
          archivos: [] // Aquí podrías procesar los archivos del formData si quisieras
        };
        expedientesDB.push(nuevoExpediente);

        // Extraer autores
        const estudiantesIds = formData.getAll('estudiantesIds').map(Number);
        const autores: TesisAutor[] = estudiantesIds.map(eid => {
          const est = estudiantesDB.find(e => e.id === eid);
          return {
            id: Date.now() + eid, tesisId: nuevaTesisId, estudianteId: eid,
            estudianteNombres: est?.nombres || '', estudiantePrimerApellido: est?.primerApellido || '',
            estudianteSegundoApellido: est?.segundoApellido || '', estudianteDNI: est?.numeroDocumento || '',
            estudianteCorreo: est?.correoInstitucional || '', fechaAsociacion: new Date().toISOString().split('T')[0], estado: 1
          };
        });

        const nuevaTesis: Tesis = {
          id: nuevaTesisId,
          escuelaId: escuela.id,
          escuelaDenominacion: escuela.denominacion,
          titulo: formData.get('titulo') as string,
          estadoCodigo: '003001',
          estadoDenominacion: 'EN TRAMITE',
          fechaRegistro: new Date().toISOString(),
          autores: autores,
          expedienteActivo: nuevoExpediente
        };

        tesisDB.push(nuevaTesis);
        return { message: 'Tesis registrada', data: nuevaTesis, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/tesis\/detalle\/[a-zA-Z0-9-]+/.test(url),
      handle: (req) => {
        const id = req.url.split('/').pop();
        const tesis = tesisDB.find(t => t.id === id);
        if (!tesis) throw { status: 404, message: 'Tesis no encontrada' };
        return { message: 'OK', data: tesis, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/tesis\/[a-zA-Z0-9-]+$/.test(url),
      handle: (req) => {
        const id = req.url.split('/').pop();
        const tesis = tesisDB.find(t => t.id === id);
        if (!tesis) throw { status: 404, message: 'Tesis no encontrada' };
        return { message: 'OK', data: tesis, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- EXPEDIENTES ----------
  expediente: [
    {
      method: 'GET',
      test: url => /\/expediente\/listarPorTesis\/[a-zA-Z0-9-]+$/.test(url),
      handle: (req) => {
        const tesisId = req.url.split('/').pop();
        const filtrados = expedientesDB.filter(e => e.tesisId === tesisId && e.estado === 1);
        return { message: 'OK', data: filtrados, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/expediente\/listarPorTesis\/[a-zA-Z0-9-]+\/[0-9A-Z]+/.test(url),
      handle: (req) => {
        const partes = req.url.split('/');
        const tesisId = partes[partes.length - 2];
        const etapa = partes[partes.length - 1];
        const filtrados = expedientesDB.filter(e => e.tesisId === tesisId && e.etapaCodigo === etapa && e.estado === 1);
        return { message: 'OK', data: filtrados, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/expediente\/listarArchivosPorExpediente\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const exp = expedientesDB.find(e => e.id === id);
        return { message: 'OK', data: exp?.archivos || [], status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/expediente/agregarArchivo'),
      handle: (req) => {
        const formData = req.body as FormData;
        const expedienteId = Number(formData.get('expedienteId'));
        const file = formData.get('archivo') as File; // Asumo que el campo se llama 'archivo' o 'file'

        const nuevoArchivo: ExpedienteArchivo = {
          id: nextArchivoId++,
          nombreArchivo: file?.name || 'documento.pdf',
          archivoUrl: `mock/archivo-${nextArchivoId}.pdf`,
          tamanioBytes: file?.size || 1024
        };

        const exp = expedientesDB.find(e => e.id === expedienteId);
        if (exp) exp.archivos.push(nuevoArchivo);

        return { message: 'Archivo agregado', data: nuevoArchivo, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/expediente\/eliminarArchivo\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        // Buscar en todos los expedientes y eliminar el archivo
        expedientesDB.forEach(exp => {
          const idx = exp.archivos.findIndex(a => a.id === id);
          if (idx !== -1) exp.archivos.splice(idx, 1);
        });
        return { message: 'Archivo eliminado', data: null, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => url.includes('/expediente/actualizarPasoYEstado'),
      handle: (req) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const id = Number(urlObj.searchParams.get('id'));
        const paso = Number(urlObj.searchParams.get('paso'));
        const estado = urlObj.searchParams.get('estado') as string;

        const exp = expedientesDB.find(e => e.id === id);
        if (exp) {
          exp.ultimoPaso = paso;
          exp.estadoCodigo = estado;
        }
        return { message: 'Paso y estado actualizados', data: exp, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => url.includes('/expediente/desactivar'),
      handle: (req) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const id = Number(urlObj.searchParams.get('id'));
        const exp = expedientesDB.find(e => e.id === id);
        if (exp) exp.estado = 0; // 0 = Inactivo
        return { message: 'Expediente desactivado', data: exp, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/expediente\/activar\/\d+/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const exp = expedientesDB.find(e => e.id === id);
        if (exp) exp.estado = 1;
        return { message: 'Expediente activado', data: exp, status: 'success', code: '200' };
      }
    },
    {
      method: 'PUT',
      test: url => /\/expediente\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = expedientesDB.findIndex(e => e.id === id);
        if (idx === -1) throw { status: 404, message: 'Expediente no encontrado' };

        expedientesDB[idx] = { ...expedientesDB[idx], ...req.body };
        return { message: 'Expediente actualizado', data: expedientesDB[idx], status: 'success', code: '200' };
      }
    },
    {
      method: 'POST',
      test: url => url.endsWith('/expediente'),
      handle: (req) => {
        const formData = req.body as FormData;
        const tesisId = formData.get('tesisId') as string;

        const nuevo: Expediente = {
          id: nextExpedienteId++,
          tesisId: tesisId,
          numeroExpediente: formData.get('numeroExpediente') as string,
          etapaCodigo: formData.get('etapaCodigo') as string,
          etapaDenominacion: 'NUEVA ETAPA',
          numRevision: Number(formData.get('numeroRevision') || 1),
          fechaAsociacion: new Date().toISOString().split('T')[0],
          estadoCodigo: '007001',
          estadoDenominacion: 'REGISTRADO',
          ultimoPaso: 1,
          comisionId: 1,
          estado: 1,
          archivos: []
        };
        expedientesDB.push(nuevo);
        return { message: 'Expediente registrado', data: nuevo, status: 'success', code: '200' };
      }
    },
    {
      method: 'GET',
      test: url => /\/expediente\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const exp = expedientesDB.find(e => e.id === id);
        if (!exp) throw { status: 404, message: 'Expediente no encontrado' };
        return { message: 'OK', data: exp, status: 'success', code: '200' };
      }
    },
    {
      method: 'DELETE',
      test: url => /\/expediente\/\d+$/.test(url),
      handle: (req) => {
        const id = Number(req.url.split('/').pop());
        const idx = expedientesDB.findIndex(e => e.id === id);
        if (idx !== -1) expedientesDB.splice(idx, 1);
        return { message: 'Expediente eliminado', data: null, status: 'success', code: '200' };
      }
    },
  ],

  // ---------- DESCARGA DE ARCHIVOS (FileService) ----------
  file: [
    {
      method: 'GET',
      test: url => /\/file\/(plantillas\/descargar|descargarWord|descargarPdf)/.test(url),
      handle: (req) => {
        // Si la petición es para un PDF, devolvemos un PDF válido
        if (req.url.includes('descargarPdf')) {
          const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 73 >>
stream
BT
/F1 24 Tf
100 700 Td
(Este es un PDF simulado) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000150 00000 n 
0000000250 00000 n 
0000000380 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;
          return new Blob([pdfContent], { type: 'application/pdf' });
        }

        // Para plantillas y Word, devolvemos el archivo de Word
        return new Blob(['Este es un documento Word simulado desde el interceptor. Intente correr el backedn SIGTE-BACKEND (rama dev) y la rama dev de SIGTE-FRONTEND'], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      }
    },
  ]

};
