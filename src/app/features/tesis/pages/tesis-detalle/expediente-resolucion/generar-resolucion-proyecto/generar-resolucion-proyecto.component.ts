import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificacionService } from '../../../../../../shared/services/notificacion.service';
import { TesisDocumentoService } from '../../../../services/tesis-documento.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GenerarResolucionProyectoRequest } from '../../../../../../shared/models/tramites/documento-tesis.model';
import { GlobalLoadingComponent } from '../../../../../../shared/components/global-loading/global-loading.component';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';

@Component({
  imports: [GlobalLoadingComponent, DialogModule, ReactiveFormsModule, ButtonComponent],
  selector: 'app-generar-resolucion-proyecto',
  styleUrl: './generar-resolucion-proyecto.component.css',
  templateUrl: './generar-resolucion-proyecto.component.html',
})
export class GenerarResolucionProyectoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificacionService);
  private readonly documentoTesisService = inject(TesisDocumentoService);

  tesisId = input.required<string>();
  expedienteId = input.required<number>();

  onSuccess = output<void>();

  private readonly anioActual = new Date().getFullYear();

  readonly visible = signal(false);
  readonly generandoResolucion = signal(false);

  readonly formResolucion: FormGroup<{
    numeroResolucion: FormControl<number>;
    anioResolucion: FormControl<number>;
  }> = this.fb.nonNullable.group({
    numeroResolucion: [1, [
      Validators.required,
      Validators.min(1)
    ]],
    anioResolucion: [this.anioActual, [
      Validators.required,
      Validators.min(2015)
    ]]
  });

  readonly numeroCorrelativo = toSignal(
    this.formResolucion.controls.numeroResolucion.valueChanges,
    { initialValue: this.formResolucion.controls.numeroResolucion.value }
  );

  readonly anio = toSignal(
    this.formResolucion.controls.anioResolucion.valueChanges,
    { initialValue: this.formResolucion.controls.anioResolucion.value }
  );

  readonly tituloResolucion = computed(
    () =>
      `Resolución Decanal N° ${this.numeroCorrelativo()}-${this.anio()}-UNSCH-FCSA-D`
  );

  abrir(): void {
    this.formResolucion.reset({
      numeroResolucion: 1,
      anioResolucion: this.anioActual,
    });
    this.visible.set(true);
  }

  cerrarModal(): void {
    this.visible.set(false);
  }

  generarResolucion(): void {
    if (this.formResolucion.invalid) {
      this.formResolucion.markAllAsTouched();
      return;
    }

    const request: GenerarResolucionProyectoRequest = {
      expedienteId: this.expedienteId(),
      ...this.formResolucion.getRawValue(),
    };

    this.generandoResolucion.set(true);
    this.documentoTesisService.generarResolucionProyecto(request).subscribe({
      next: (response) => {
        this.generandoResolucion.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(
          response.message || 'Resolución generado correctamente'
        );
        this.onSuccess.emit();
      },
      error: () => {
        this.generandoResolucion.set(false);
        this.notificationService.showError('No se pudo generar la resolucion. Intente nuevamente.');
      },
    });
  }
}
