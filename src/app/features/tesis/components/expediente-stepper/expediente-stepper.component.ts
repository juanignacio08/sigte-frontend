import { Component, computed, input } from '@angular/core';

interface PasoExpediente {
  titulo: string;
  descripcion: string;
}

@Component({
  imports: [],
  selector: 'app-expediente-stepper',
  styleUrl: './expediente-stepper.component.css',
  templateUrl: './expediente-stepper.component.html',
})
export class ExpedienteStepperComponent {

  readonly pasoActual = input<number>(1);

  readonly pasos: PasoExpediente[] = [
    { titulo: 'Datos y PDFs', descripcion: 'Documentación' },
    { titulo: 'Comisión', descripcion: 'Pendiente' },
    { titulo: 'Memorando', descripcion: 'Pendiente' },
    { titulo: 'Enviar correo', descripcion: 'Pendiente' },
    { titulo: 'Dictamen', descripcion: 'Pendiente' },
    { titulo: 'Resolución', descripcion: 'Pendiente' },
  ];

  readonly porcentaje = computed(
    () => ((this.pasoActual() - 1) / (this.pasos.length - 1)) * 100
  );
}
