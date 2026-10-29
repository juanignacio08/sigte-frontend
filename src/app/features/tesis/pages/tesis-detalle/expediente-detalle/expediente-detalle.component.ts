import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';
import { FileService } from '../../../../../shared/services/file.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { Expediente, ExpedienteArchivo } from '../../../../../shared/models/tramites/expediente.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { ExpedienteAddEditComponent } from '../../expediente-tab/expediente-add-edit/expediente-add-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExpedienteWizardStore } from '../expediente-wizard.store';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';

@Component({
  selector: 'app-expediente-detalle',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    ExpedienteAddEditComponent,
    ConfirmDialogComponent,
    NoConnectionComponent
],
  templateUrl: './expediente-detalle.component.html',
})
export class ExpedienteDetalleComponent implements OnInit {

  modalAddEdit = viewChild<ExpedienteAddEditComponent>('modalAddEdit');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  private readonly router = inject(Router);

  private readonly expedienteService  = inject(TesisExpedienteService);
  private readonly fileService        = inject(FileService);
  private readonly notificationService = inject(NotificacionService);

  // ✅ Store compartido — el wizard padre ya cargó tesis y expediente
  protected readonly store = inject(ExpedienteWizardStore);
  readonly tesis       = this.store.tesis;
  readonly expediente  = this.store.expediente;
  readonly tesisId     = this.store.tesisId;        // string | null
  readonly expedienteId = this.store.expedienteId;  // number | null

  // ✅ Estado local del step
  readonly archivos           = signal<ExpedienteArchivo[]>([]);
  readonly archivosPendientes = signal<File[]>([]);
  readonly loadingOperation   = signal(false);
  readonly connectionError    = signal(false);

  readonly confirmAction = {
    selectedItem:   signal<ExpedienteArchivo | null>(null),
    selectedAction: signal<ConfirmActionType>('delete'),
  };

  private readonly MAX_ARCHIVOS = 5;

  readonly numeroArchivos = computed(
    () => this.archivos().length + this.archivosPendientes().length,
  );

  readonly espaciosDisponibles = computed(
    () => Math.max(0, this.MAX_ARCHIVOS - this.numeroArchivos()),
  );

  readonly puedeSeguirAgregandoArchivos = computed(
    () => this.espaciosDisponibles() > 0,
  );

  ngOnInit(): void {
    this.cargarArchivos();
  }

  // ======================== CARGA ========================
  private cargarArchivos(): void {
    const expId = this.expedienteId();
    if (!expId) return;

    this.loadingOperation.set(true);
    this.expedienteService.obtenerArchivosPorExpediente(expId).subscribe({
      next:  (res) => {
        this.archivos.set(res.data)
        this.loadingOperation.set(false);
      },
      error: () => this.connectionError.set(true),
    });
  }

  reloadDocuments(): void {
    this.cargarArchivos();
  }

  // ======================== ACCIONES ========================
  abrirEdicion(): void {
    const exp = this.expediente();
    if (exp) this.modalAddEdit()?.abrirEdicionDesdeDetalle(exp);
  }

  actualizarExpediente(actualizado: Expediente): void {
    const actual = this.expediente();
    if (!actual) return;

    this.store.actualizarExpediente({
      ...actual,
      numeroExpediente: actualizado.numeroExpediente,
      numRevision:      actualizado.numRevision,
      fechaAsociacion:  actualizado.fechaAsociacion,
      ultimoPaso:       actualizado.ultimoPaso,
      estadoCodigo:     actualizado.estadoCodigo
    });
  }

  mostrarPdf(ruta: string | null): void {
    if (!ruta) return;

    const win = window.open('', '_blank');

    this.fileService.descargarPdf(ruta).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (win) win.location.href = url;
        else window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        win?.close();
        console.error('Error al abrir el PDF:', err);
        this.notificationService.showError('No se pudo abrir el archivo.');
      },
    });
  }

  async copiarNumero(numero: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(numero);
    } catch {
      this.notificationService.showError('No se pudo copiar el número del expediente.');
    }
  }

  // ======================== ARCHIVOS: SUBIR ========================
  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.agregarArchivos(Array.from(input.files ?? []));
    input.value = '';
  }

  permitirArrastre(event: DragEvent): void {
    event.preventDefault();
  }

  soltarArchivos(event: DragEvent): void {
    event.preventDefault();
    this.agregarArchivos(Array.from(event.dataTransfer?.files ?? []));
  }

  private agregarArchivos(archivos: File[]): void {
    const MAX_SIZE = 10 * 1024 * 1024;
    const nuevos = [...this.archivosPendientes()];
    const registrados = this.archivos().length;
    let agregados = 0;
    let limiteAvisado = false;

    for (const archivo of archivos) {
      const esPdf =
        archivo.type === 'application/pdf' &&
        archivo.name.toLowerCase().endsWith('.pdf');
      if (!esPdf) {
        this.notificationService.showError(`${archivo.name}: el archivo debe ser un PDF.`);
        continue;
      }
      if (archivo.size > MAX_SIZE) {
        this.notificationService.showError(`${archivo.name}: supera el límite de 10 MB.`);
        continue;
      }
      const duplicado = nuevos.some(
        (e) => e.name === archivo.name && e.size === archivo.size && e.lastModified === archivo.lastModified,
      );
      if (duplicado) continue;

      if (registrados + nuevos.length >= this.MAX_ARCHIVOS) {
        if (!limiteAvisado) {
          this.notificationService.showWarn(
            `Solo se permiten ${this.MAX_ARCHIVOS} archivos PDF por expediente.`,
          );
          limiteAvisado = true;
        }
        break;
      }
      nuevos.push(archivo);
      agregados++;
    }

    if (agregados > 0) this.archivosPendientes.set(nuevos);
  }

  quitarArchivoPendiente(index: number): void {
    this.archivosPendientes.update((arr) => arr.filter((_, i) => i !== index));
  }

  persistirArchivo(index: number): void {
    const archivo = this.archivosPendientes()[index];
    const expId = this.expedienteId();
    if (!archivo || expId == null) {
      this.notificationService.showError('No se encontró el archivo o el expediente.');
      return;
    }

    this.loadingOperation.set(true);   // ✅ local, no del store

    const formData = new FormData();
    formData.append('expedienteId', expId.toString());
    formData.append('archivo', archivo);

    this.expedienteService.registrarArchivo(formData).subscribe({
      next: (res) => {
        this.loadingOperation.set(false);
        this.notificationService.showSuccess(res.message || 'Archivo registrado correctamente');
        this.archivosPendientes.update((arr) => arr.filter((_, i) => i !== index));
        this.reloadDocuments();
      },
      error: () => {
        this.loadingOperation.set(false);
        this.notificationService.showError('No se pudo registrar el archivo.');
      },
    });
  }

  // ======================== ARCHIVOS: ELIMINAR ========================
  eliminarArchivo(archivo: ExpedienteArchivo): void {
    this.confirmAction.selectedItem.set(archivo);
    this.confirmAction.selectedAction.set('delete');
    this.confirmModal()?.abrir('delete', `el archivo ${archivo.nombreArchivo} de este expediente`);
  }

  ejecutarAccionConfirmada(_motivo?: string | void): void {
    const archivo = this.confirmAction.selectedItem();
    if (!archivo) return;

    this.confirmModal()?.loading.set(true);

    this.expedienteService.eliminarArchivo(archivo.id).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message || 'Archivo eliminado del expediente.');
        this.confirmModal()?.cerrar();
        this.reloadDocuments();
      },
      error: () => this.confirmModal()?.loading.set(false),
    });
  }

  // ======================== NAVEGACIÓN ========================
  volverATesis(): void {
    const id = this.tesisId();
    if (id) this.router.navigate(['/tesis', 'detalle', id]);
  }

  continuarSiguientePaso(): void {
    if (this.archivosPendientes().length > 0) {
      this.notificationService.showError('Aún tiene archivos pendientes de guardar.');
      return;
    }
    this.router.navigate([
      '/tesis', 'detalle', this.tesisId(),
      'expediente', this.expedienteId(),
      'comision',
    ]);
  }
}