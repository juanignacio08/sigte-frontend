import { Component, ViewChild } from '@angular/core';
import { FullCalendarModule, CalendarOptions, FullCalendarComponent } from "@fullcalendar/angular";
import themePlugin from "@fullcalendar/angular/themes/monarch"; // YOUR THEME
import dayGridPlugin from "@fullcalendar/angular/daygrid";
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import esLocale from "fullcalendar/locales/es";
import { FormsModule } from '@angular/forms';

interface Escuela {
  codigo: string;
  nombre: string;
  color: string;
}

interface Ambiente {
  id: number;
  nombre: string;
}

interface SustentacionMock {
  id: number;
  titulo: string;
  escuela: string;
  ambienteId: number;
  modalidad: 'PRESENCIAL' | 'VIRTUAL';
  estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'REPROGRAMADA';
  inicio: string;
  fin: string;
}

@Component({
  imports: [FullCalendarModule, FormsModule],
  selector: 'app-expediente-fecha-sustentacion',
  styleUrl: './expediente-fecha-sustentacion.component.css',
  templateUrl: './expediente-fecha-sustentacion.component.html',
})
export class ExpedienteFechaSustentacionComponent {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  escuelas: Escuela[] = [
    { codigo: 'MED', nombre: 'Medicina Humana', color: '#3B82F6' },
    { codigo: 'ENF', nombre: 'Enfermería', color: '#16A34A' },
    { codigo: 'OBS', nombre: 'Obstetricia', color: '#9333EA' },
    { codigo: 'FAR', nombre: 'Farmacia y Bioquímica', color: '#EA580C' },
    { codigo: 'PSI', nombre: 'Psicología', color: '#DB2777' },
  ];

  ambientes: Ambiente[] = [
    { id: 1, nombre: 'Auditorio de Medicina' },
    { id: 2, nombre: 'Auditorio de Enfermería' },
    { id: 3, nombre: 'Auditorio de Obstetricia' },
    { id: 4, nombre: 'Sala de Grados' },
  ];

  // Filtros
  alcance = 'FACULTAD';
  escuelaSeleccionada = 'TODAS';
  ambienteSeleccionado = 'TODOS';
  modalidadSeleccionada = 'TODAS';
  estadoSeleccionado = 'TODOS';

  sustentaciones: SustentacionMock[] = [
    {
      id: 1,
      titulo: 'Factores asociados a la anemia',
      escuela: 'ENF',
      ambienteId: 1,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-13T08:00:00',
      fin: '2026-11-13T09:30:00'
    },
    {
      id: 2,
      titulo: 'Calidad de atención materna',
      escuela: 'OBS',
      ambienteId: 3,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-13T09:00:00',
      fin: '2026-11-13T10:30:00'
    },
    {
      id: 3,
      titulo: 'Salud mental en estudiantes',
      escuela: 'PSI',
      ambienteId: 2,
      modalidad: 'VIRTUAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-14T10:00:00',
      fin: '2026-11-14T11:30:00'
    },
    {
      id: 4,
      titulo: 'Adherencia al tratamiento',
      escuela: 'MED',
      ambienteId: 1,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-16T14:00:00',
      fin: '2026-11-16T15:30:00'
    },
    {
      id: 5,
      titulo: 'Uso racional de medicamentos',
      escuela: 'FAR',
      ambienteId: 3,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-16T15:00:00',
      fin: '2026-11-16T16:30:00'
    },
    {
      id: 6,
      titulo: 'Intervención en salud comunitaria',
      escuela: 'ENF',
      ambienteId: 2,
      modalidad: 'PRESENCIAL',
      estado: 'REALIZADA',
      inicio: '2026-11-10T08:00:00',
      fin: '2026-11-10T09:30:00'
    },
    {
      id: 7,
      titulo: 'Complicaciones obstétricas',
      escuela: 'OBS',
      ambienteId: 3,
      modalidad: 'PRESENCIAL',
      estado: 'REPROGRAMADA',
      inicio: '2026-11-19T11:00:00',
      fin: '2026-11-19T12:30:00'
    },
    {
      id: 8,
      titulo: 'Evaluación psicológica',
      escuela: 'PSI',
      ambienteId: 4,
      modalidad: 'VIRTUAL',
      estado: 'CANCELADA',
      inicio: '2026-11-20T09:00:00',
      fin: '2026-11-20T10:30:00'
    },
    {
      id: 9,
      titulo: 'Investigación clínica',
      escuela: 'MED',
      ambienteId: 1,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-23T08:00:00',
      fin: '2026-11-23T10:00:00'
    },
    {
      id: 10,
      titulo: 'Farmacovigilancia en pacientes',
      escuela: 'FAR',
      ambienteId: 4,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-23T10:00:00',
      fin: '2026-11-23T11:30:00'
    }
  ];

  calendarOptions: CalendarOptions = {
    plugins: [
      themePlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
    ],

    initialView: 'dayGridMonth',
    locale: esLocale,
    weekends: false,

    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    events: (fetchInfo, successCallback) => {
      successCallback(this.obtenerEventosFiltrados());
    },

    eventDisplay: 'block',

    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };

  obtenerEventosFiltrados() {
    return this.sustentaciones
      .filter(evento => {
        const escuelaOk =
          this.escuelaSeleccionada === 'TODAS' ||
          evento.escuela === this.escuelaSeleccionada;

        const ambienteOk =
          this.ambienteSeleccionado === 'TODOS' ||
          evento.ambienteId.toString() === this.ambienteSeleccionado;

        const modalidadOk =
          this.modalidadSeleccionada === 'TODAS' ||
          evento.modalidad === this.modalidadSeleccionada;

        const estadoOk =
          this.estadoSeleccionado === 'TODOS' ||
          evento.estado === this.estadoSeleccionado;

        return escuelaOk && ambienteOk && modalidadOk && estadoOk;
      })
      .map(evento => {
        const escuela = this.escuelas.find(
          e => e.codigo === evento.escuela
        );

        const color = escuela?.color ?? '#64748b';

        return {
          id: evento.id.toString(),
          title: evento.titulo,
          start: evento.inicio,
          end: evento.fin,

          color: color,

          //backgroundColor: escuela?.color,
          //borderColor: escuela?.color,

          extendedProps: {
            escuela: escuela?.nombre,
            ambiente: this.ambientes.find(
              a => a.id === evento.ambienteId
            )?.nombre,
            modalidad: evento.modalidad,
            estado: evento.estado
          }
        };
      });
  }

  aplicarFiltros() {
    this.calendarComponent.getApi().refetchEvents();
  }

}
