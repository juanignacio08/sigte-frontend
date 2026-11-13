import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { TesisDocumentoService } from '../../../../services/tesis-documento.service';
import { NotificacionService } from '../../../../../../shared/services/notificacion.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GenerarMemoRequest } from '../../../../../../shared/models/tramites/documento-tesis.model';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { GlobalLoadingComponent } from '../../../../../../shared/components/global-loading/global-loading.component';

@Component({
  imports: [
    DialogModule,
    ReactiveFormsModule,
    ButtonComponent,
    GlobalLoadingComponent
],
  selector: 'app-generar-memo-modal',
  styleUrl: './generar-memo-modal.component.css',
  templateUrl: './generar-memo-modal.component.html',
})
export class GenerarMemoModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificacionService);
  private readonly documentoTesisService = inject(TesisDocumentoService);

  tesisId = input.required<string>();
  expedienteId = input.required<number>();

  onSuccess = output<void>();

  private readonly anioActual = new Date().getFullYear();

  readonly visible = signal(false);
  readonly generandoMemo = signal(false);

  readonly formMemo: FormGroup<{
    numeroCorrelativo: FormControl<number>;
    anio: FormControl<number>;
  }> = this.fb.nonNullable.group({
    numeroCorrelativo: [1, [
      Validators.required,
      Validators.min(1)
    ]],
    anio: [this.anioActual, [
      Validators.required,
      Validators.min(2015)
    ]]
  });

  readonly numeroCorrelativo = toSignal(
    this.formMemo.controls.numeroCorrelativo.valueChanges,
    { initialValue: this.formMemo.controls.numeroCorrelativo.value }
  );

  readonly anio = toSignal(
    this.formMemo.controls.anio.valueChanges,
    { initialValue: this.formMemo.controls.anio.value }
  );

  readonly tituloMemo = computed(
    () =>
      `Memorando Múltiple N° ${this.numeroCorrelativo()}-${this.anio()}-UNSCH-FCSA-D`
  );

  abrir(): void {
    this.formMemo.reset({
      numeroCorrelativo: 1,
      anio: this.anioActual,
    });
    this.visible.set(true);
  }

  cerrarModal(): void {
    this.visible.set(false);
  }

  generarMemo(): void {
    if (this.formMemo.invalid) {
      this.formMemo.markAllAsTouched();
      return;
    }

    const request: GenerarMemoRequest = {
      tesisId: this.tesisId(),
      expedienteId: this.expedienteId(),
      ...this.formMemo.getRawValue(),
    };

    this.generandoMemo.set(true);
    this.documentoTesisService.generarMemo(request).subscribe({
      next: (response) => {
        this.generandoMemo.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(
          response.message || 'Memorando generado correctamente'
        );
        this.onSuccess.emit();
      },
      error: () => {
        this.generandoMemo.set(false);
        this.notificationService.showError('No se pudo generar el memorando. Intente nuevamente.');
      },
    });
  }
}
