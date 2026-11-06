import { Component, inject, input, output, signal } from '@angular/core';
import { RegistrarDictamenRequest } from '../../../../../../shared/models/tramites/documento-tesis.model';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../../../../shared/services/notificacion.service';
import { TesisDocumentoService } from '../../../../services/tesis-documento.service';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';

@Component({
  imports: [DialogModule, ButtonComponent, CommonModule, FormsModule, DatePickerModule],
  selector: 'app-registrar-dictamen',
  styleUrl: './registrar-dictamen.component.css',
  templateUrl: './registrar-dictamen.component.html',
})
export class RegistrarDictamenComponent {

  private readonly documentoTesisService = inject(TesisDocumentoService);
  private readonly notificationService = inject(NotificacionService);

  expedienteId = input.required<number>();
  tituloTesis = input.required<string>();

  onSuccess = output<void>();

  readonly visible = signal(false);
  readonly guardando = signal(false);

  readonly resultadoCodigo = signal('008001');
  readonly observaciones = signal('');
  readonly fechaEmision = signal('');

  readonly archivoSeleccionado = signal<File | null>(null);
  readonly errorArchivo = signal('');

  readonly tituloDictaminado = signal('');

  readonly resultadoOpciones = [
    {
      codigo: '008001',
      nombre: 'APROBADO',
      descripcion: 'Expediente listo para emisión de Resolución Decanal.',
      icono: 'pi pi-check',
      clases: 'border-blue-900 bg-indigo-50'
    },
    {
      codigo: '008002',
      nombre: 'OBSERVADO',
      descripcion: 'Devuelve el expediente para subsanación.',
      icono: 'pi pi-times',
      clases: 'border-red-500 bg-red-50'
    }
  ];

  abrirModal(): void {
    this.resultadoCodigo.set('008001');
    this.tituloDictaminado.set(this.tituloTesis());

    this.observaciones.set('');
    this.fechaEmision.set('');

    this.archivoSeleccionado.set(null);
    this.errorArchivo.set('');

    this.visible.set(true);
  }

  seleccionarResultado(codigo: string): void {
    this.resultadoCodigo.set(codigo);

    if (codigo === '008001' && !this.tituloDictaminado().trim()) {
      this.tituloDictaminado.set(this.tituloTesis());
    }
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
    const extensionesPermitidas = ['pdf', 'doc', 'docx'];

    if (!extension || !extensionesPermitidas.includes(extension)) {
      this.errorArchivo.set('Solo se permiten archivos PDF, DOC o DOCX.');
      input.value = '';
      return;
    }

    const esPdf = extension === 'pdf';
    const tipoValido = esPdf
      ? archivo.type === 'application/pdf' || archivo.type === ''
      : archivo.type === 'application/msword' ||
      archivo.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      archivo.type === '';

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

    const aprobado = this.resultadoCodigo() === '008001';

    if (aprobado && !this.tituloDictaminado().trim()) {
      this.notificationService.showError(
        'Debe ingresar el título dictaminado.'
      );
      return;
    }

    let archivoPdf: File | undefined = undefined;
    let archivoWord: File | undefined = undefined;

    if (archivo) {
      const extension = archivo.name.split('.').pop()?.toLowerCase();

      if (extension === 'pdf') {
        archivoPdf = archivo;
      } else if (['doc', 'docx'].includes(extension ?? '')) {
        archivoWord = archivo;
      }
    }

    const request: RegistrarDictamenRequest = {
      expedienteId: this.expedienteId(),
      resultadoCodigo: this.resultadoCodigo(),
      tituloDictaminado: aprobado
        ? this.tituloDictaminado().trim()
        : undefined,
      observaciones: this.observaciones().trim() || undefined,
      fechaEmision: this.fechaEmision() || undefined,
      archivoPdf,
      archivoWord
    };

    this.guardando.set(true);

    this.documentoTesisService.registrarDictamen(request).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.cerrarModal();
        this.notificationService.showSuccess(res.message || 'Dictamen registrado correctamente');
        this.onSuccess.emit();
      },
      error: () => this.guardando.set(false),
    });
  }

}
