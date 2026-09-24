import { Component, computed, signal } from '@angular/core';
import { TitleSubtitleComponent } from '../../../shared/components/title-subtitle/title-subtitle.component';
import { DepartamentoAcademico } from '../../../shared/models/master/departamento_academico.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { TableModule } from '@openng/optimus-ui/table';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  imports: [TitleSubtitleComponent, TableModule, ButtonComponent, CommonModule, BadgeComponent],
  selector: 'app-departamento-academico',
  styleUrl: './departamento-academico.component.css',
  templateUrl: './departamento-academico.component.html',
})
export class DepartamentoAcademicoComponent {
  title = 'Departamentos Académicos';
  subtitle = 'Gestión de Departamentos Académicos para la Facultad de Ciencias de la Salud.';
  icon = 'pi-building-columns';

  // Mock de la facultad con ID 1
  readonly facultadId = 1;

  // Signal con datos de prueba basados en tu response del Backend
  departamentos = signal<DepartamentoAcademico[]>([
    {
      id: 1,
      facultadId: 1,
      abreviatura: 'DAFB',
      denominacion: 'Departamento Académico de Farmacia y Bioquímica',
      estado: 0,
      totalEscuelas: 1,
      resolucionCreacion: 'Resolución de creación N° 102-1981-CU'
    },
    {
      id: 2,
      facultadId: 1,
      abreviatura: 'DAENF',
      denominacion: 'Departamento Académico de Enfermería',
      estado: 1,
      totalEscuelas: 1,
      resolucionCreacion: 'Resolución de creación N° 088-1984-CU'
    },
    {
      id: 3,
      facultadId: 1,
      abreviatura: 'DAMH',
      denominacion: 'Departamento Académico de Medicina Humana',
      estado: 1,
      totalEscuelas: 1,
      resolucionCreacion: 'Resolución de creación N° 214-1998-CU'
    },
    {
      id: 4,
      facultadId: 1,
      abreviatura: 'DAOB',
      denominacion: 'Departamento Académico de Obstetricia',
      estado: 1,
      totalEscuelas: 2,
      resolucionCreacion: 'Resolución de creación N° 065-1979-CU'
    }
  ]);

  // Contadores calculados para las tarjetas superiores
  totalRegistrados = computed(() => this.departamentos().length);
  totalActivos = computed(() => this.departamentos().filter(d => d.estado === 1).length);
  totalEscuelasVinculadas = computed(() => 
    this.departamentos().reduce((acc, curr) => acc + curr.totalEscuelas, 0)
  );

  // Acciones
  crearNuevo() {
    console.log('Abrir modal/vista de nuevo departamento');
  }

  exportar() {
    console.log('Exportar lista');
  }

  verEscuelas(dept: DepartamentoAcademico) {
    console.log('Ver escuelas adscritas a:', dept.denominacion);
  }

  editar(dept: DepartamentoAcademico) {
    console.log('Editar:', dept.id);
  }

  verDetalle(dept: DepartamentoAcademico) {
    console.log('Ver detalle:', dept.id);
  }

  eliminar(dept: DepartamentoAcademico) {
    console.log('Eliminar:', dept.id);
  }
}
