import { Component, computed, input, signal } from '@angular/core';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';
import { CommonModule } from '@angular/common';

interface PasoExpediente {
  titulo: string;
  descripcion: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-expediente-stepper',
  styleUrl: './expediente-stepper.component.css',
  templateUrl: './expediente-stepper.component.html',
})
export class ExpedienteStepperComponent {

  readonly pasoActual = input<number>(1);
  readonly etapaActual = input<string | null>(null);

  readonly pasosProyecto: PasoExpediente[] = [
    { titulo: 'Datos y PDFs', descripcion: 'Documentación' },
    { titulo: 'Comisión', descripcion: 'Pendiente' },
    { titulo: 'Memorando', descripcion: 'Pendiente' },
    { titulo: 'Enviar correo', descripcion: 'Pendiente' },
    { titulo: 'Dictamen', descripcion: 'Pendiente' },
    { titulo: 'Resolución', descripcion: 'Pendiente' },
  ];

  readonly pasosBorrador: PasoExpediente[] = [
    { titulo: 'Datos y PDFs', descripcion: 'Documentación' },
    { titulo: 'Comisión', descripcion: 'Pendiente' },
    { titulo: 'Memorando', descripcion: 'Pendiente' },
    { titulo: 'Enviar correo', descripcion: 'Pendiente' },
    { titulo: 'Dictamen', descripcion: 'Pendiente' },
    { titulo: 'Fecha de Sustentación', descripcion: 'Pendiente' },
    { titulo: 'Comisión de Sustentación', descripcion: 'Pendiente' },
    { titulo: 'Resolución', descripcion: 'Pendiente' },
  ];

  readonly pasos = computed(() =>
    this.etapaActual() === TablaMaestraService.stageThesisDraft
      ? this.pasosBorrador
      : this.pasosProyecto
  );

  readonly porcentaje = computed(() => {
    const total = this.pasos().length;

    if (total <= 1) return 0;

    return ((this.pasoActual() - 1) / (total - 1)) * 100;
  });
  
}
