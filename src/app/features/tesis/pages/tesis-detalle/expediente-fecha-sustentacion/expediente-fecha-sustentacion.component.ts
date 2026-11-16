import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FullCalendarModule, CalendarOptions, FullCalendarComponent } from "@fullcalendar/angular";
import themePlugin from "@fullcalendar/angular/themes/monarch"; // YOUR THEME
import dayGridPlugin from "@fullcalendar/angular/daygrid";
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import esLocale from "fullcalendar/locales/es";
import { FormsModule } from '@angular/forms';
import { SelectModule } from '@openng/optimus-ui/select';
import { EscuelaProfesional } from '../../../../../shared/models/master/escuela_profesional.model';
import { forkJoin } from 'rxjs';
import { EscuelaService } from '../../../../organizacion/service/escuela.service';
import { Facultad, FACULTY_MOCK } from '../../../../../shared/models/master/facultad.model';

interface Ambiente {
  id: number;
  nombre: string;
}

interface SustentacionMock {
  id: number;
  titulo: string;
  escuelaId: number;
  ambienteId: number;
  modalidad: 'PRESENCIAL' | 'VIRTUAL';
  estado: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'REPROGRAMADA';
  inicio: string;
  fin: string;
}

@Component({
  imports: [FullCalendarModule, FormsModule, SelectModule],
  selector: 'app-expediente-fecha-sustentacion',
  styleUrl: './expediente-fecha-sustentacion.component.css',
  templateUrl: './expediente-fecha-sustentacion.component.html',
})
export class ExpedienteFechaSustentacionComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private readonly escuelaService = inject(EscuelaService);

  facultad: Facultad = FACULTY_MOCK;

  escuelasFiltro = signal<EscuelaProfesional[]>([]);

  controls = {
    loading: signal<boolean>(false),
    loadingCatalogos: signal<boolean>(false),
    connectionError: signal<boolean>(false)
  };

  ambientes: Ambiente[] = [
    { id: 1, nombre: 'Auditorio de Medicina' },
    { id: 2, nombre: 'Auditorio de Enfermería' },
    { id: 3, nombre: 'Auditorio de Obstetricia' },
    { id: 4, nombre: 'Sala de Grados' },
  ];

  // Filtros
  alcance = 'FACULTAD';
  escuelaSeleccionada = signal<number | null>(null);
  ambienteSeleccionado = 'TODOS';

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.controls.loadingCatalogos.set(true);
    forkJoin({
      escuelas: this.escuelaService.getActivesByFacultad(this.facultad.id),
      //estados: this.tablaMaestraService.getItemsActives(TablaMaestraService.stateThesisTableCode) // Código tabla estados tesis
    }).subscribe({
      next: ({ escuelas, /*estados*/}) => {
        this.escuelasFiltro.set(escuelas.data || []);
        //this.estadosFiltro.set(estados.data || []);
        this.controls.loadingCatalogos.set(false);
      },
      error: () => this.controls.loadingCatalogos.set(false)
    });
  }

  sustentaciones: SustentacionMock[] = [
    {
      id: 1,
      titulo: 'Factores asociados a la anemia',
      escuelaId: 1,
      ambienteId: 1,
      modalidad: 'PRESENCIAL',
      estado: 'PROGRAMADA',
      inicio: '2026-11-13T08:00:00',
      fin: '2026-11-13T09:30:00'
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
          this.escuelaSeleccionada() === 0 ||
          evento.escuelaId === this.escuelaSeleccionada();

        const ambienteOk =
          this.ambienteSeleccionado === 'TODOS' ||
          evento.ambienteId.toString() === this.ambienteSeleccionado;

        return escuelaOk && ambienteOk;
      })
      .map(evento => {
        const escuela = this.escuelasFiltro().find(
          e => e.codigo === evento.escuelaId
        );

        const color = '#64748b';

        return {
          id: evento.id.toString(),
          title: evento.titulo,
          start: evento.inicio,
          end: evento.fin,

          color: color,

          //backgroundColor: escuela?.color,
          //borderColor: escuela?.color,

          extendedProps: {
            escuela: escuela?.denominacion,
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
