import { Component, inject, input, output, signal } from '@angular/core';
import { PlantillaDocumentoService } from '../../../service/plantilla-documento.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { PlantillaDocumento, TipoDocumentoOpcion } from '../../../../../shared/models/master/plantilla-documento.model';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { SelectModule } from '@openng/optimus-ui/select';

@Component({
  imports: [DialogModule, SelectModule, FormsModule, CommonModule, ButtonComponent],
  selector: 'app-plantilla-add-edit',
  styleUrl: './plantilla-add-edit.component.css',
  templateUrl: './plantilla-add-edit.component.html',
})
export class PlantillaAddEditComponent {
  private readonly plantillaService = inject(PlantillaDocumentoService);
  private readonly notificationService = inject(NotificacionService);

  escuelaId = input.required<number>();
  tiposDocumento = input.required<TipoDocumentoOpcion[]>();

  onSuccess = output<void>();

  readonly visible = signal(false);
  readonly guardando = signal(false);

  readonly modoEdicion = signal(false);

  readonly plantillaSeleccionada = signal<PlantillaDocumento | null>(null);

  readonly tipoDocumentoCodigo = signal('');
  readonly plazo = signal<number | null>(null);
  readonly unidadPlazo = signal<'DIAS' | 'MESES'>('DIAS');

  readonly archivoSeleccionado = signal<File | null>(null);
  readonly errorArchivo = signal('');

  abrirRegistro(): void {
    this.modoEdicion.set(false);
    this.plantillaSeleccionada.set(null);

    this.tipoDocumentoCodigo.set('');
    this.plazo.set(null);
    this.unidadPlazo.set('DIAS');

    this.archivoSeleccionado.set(null);
    this.errorArchivo.set('');

    this.visible.set(true);
  }

  abrirEdicion(plantilla: PlantillaDocumento): void {
    this.modoEdicion.set(true);
    this.plantillaSeleccionada.set(plantilla);

    this.tipoDocumentoCodigo.set(plantilla.tipoDocumentoCodigo);

    if (plantilla.plazoMeses != null) {
      this.plazo.set(plantilla.plazoMeses);
      this.unidadPlazo.set('MESES');
    } else {
      this.plazo.set(plantilla.plazoDias);
      this.unidadPlazo.set('DIAS');
    }

    this.archivoSeleccionado.set(null);
    this.errorArchivo.set('');

    this.visible.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) return;

    this.visible.set(false);
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    const extension = archivo.name.split('.').pop()?.toLowerCase();

    if (extension !== 'docx') {
      this.errorArchivo.set('Solo se permiten archivos DOCX.');
      input.value = '';
      return;
    }

    const tipoValido =
      archivo.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || archivo.type === '';

    if (!tipoValido) {
      this.errorArchivo.set('El formato del archivo no es válido.');
      input.value = '';
      return;
    }

    const maxBytes = 10 * 1024 * 1024;

    if (archivo.size > maxBytes) {
      this.errorArchivo.set('El archivo no debe superar los 10 MB.');
      input.value = '';
      return;
    }

    this.errorArchivo.set('');
    this.archivoSeleccionado.set(archivo);
  }

  quitarArchivo(input: HTMLInputElement): void {
    this.archivoSeleccionado.set(null);
    this.errorArchivo.set('');
    input.value = '';
  }

  formatearBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  guardar(): void {
    const archivo = this.archivoSeleccionado();
    const plantilla = this.plantillaSeleccionada();

    if (!this.modoEdicion() && !this.tipoDocumentoCodigo()) {
      this.notificationService.showInfo(
        'Seleccione el tipo de documento.'
      );
      return;
    }

    if (this.plazo() !== null && (
      !Number.isInteger(this.plazo()) || this.plazo()! < 1
    )) {
      this.notificationService.showInfo(
        'El plazo debe ser un número entero mayor a cero.'
      );
      return;
    }

    if (!this.modoEdicion() && !archivo) {
      this.errorArchivo.set('Debe seleccionar el archivo DOCX.');
      return;
    }

    if (this.errorArchivo()) return;

    const request = {
      plazoDias: this.unidadPlazo() === 'DIAS'
        ? this.plazo() ?? undefined
        : undefined,

      plazoMeses: this.unidadPlazo() === 'MESES'
        ? this.plazo() ?? undefined
        : undefined
    };

    this.guardando.set(true);

    const peticion$ = this.modoEdicion()
      ? this.plantillaService.actualizar(plantilla!.id, {
        ...request,
        archivoDocx: archivo ?? undefined
      })
      : this.plantillaService.registrar({
        escuelaId: this.escuelaId(),
        tipoDocumentoCodigo: this.tipoDocumentoCodigo(),
        ...request,
        archivoDocx: archivo!
      });

    peticion$.subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.visible.set(false);

        this.notificationService.showSuccess(
          res.message || (
            this.modoEdicion()
              ? 'Plantilla actualizada correctamente.'
              : 'Plantilla registrada correctamente.'
          )
        );

        this.onSuccess.emit();
      },
      error: (err) => {
        this.guardando.set(false);

        this.notificationService.showError(
          err?.error?.message || 'No se pudo guardar la plantilla.'
        );
      }
    });
  }
}
