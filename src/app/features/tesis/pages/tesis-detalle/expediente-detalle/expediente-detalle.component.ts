import { Component, computed, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TesisExpedienteService } from '../../../services/tesis-expediente.service';
import { FileService } from '../../../../../shared/services/file.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { Expediente, ExpedienteArchivo } from '../../../../../shared/models/tramites/expediente.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { Tesis } from '../../../../../shared/models/tramites/tesis.model';
import { TesisService } from '../../../services/tesis.service';
import { forkJoin } from 'rxjs';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { ExpedienteStepperComponent } from '../../../components/expediente-stepper/expediente-stepper.component';
import { ExpedienteAddEditComponent } from '../../expediente-tab/expediente-add-edit/expediente-add-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-expediente-detalle',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    ButtonComponent,
    CommonModule,
    NoConnectionComponent,
    ExpedienteStepperComponent,
    ExpedienteAddEditComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './expediente-detalle.component.html',
})
export class ExpedienteDetalleComponent implements OnInit {

  modalAddEdit = viewChild<ExpedienteAddEditComponent>('modalAddEdit');
  confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly tesisService = inject(TesisService);
  private readonly expedienteService = inject(TesisExpedienteService);
  private readonly fileService = inject(FileService);
  private readonly notificationService = inject(NotificacionService);

  readonly loading = signal(false);
  readonly connectionError = signal(false);
  // Confirm Action
  confirmAction = { selectedItem: signal<ExpedienteArchivo | null>(null), selectedAction: signal<ConfirmActionType>('delete') }

  readonly tesis = signal<Tesis | null>(null);
  readonly expediente = signal<Expediente | null>(null);
  readonly archivos = signal<ExpedienteArchivo[]>([]);

  readonly tesisId = signal<string | null>(
    this.route.snapshot.paramMap.get('tesisId')
  );

  readonly expedienteId = signal<number | null>(
    this.obtenerExpedienteId()
  );

  readonly archivosPendientes = signal<File[]>([]);

  private readonly MAX_ARCHIVOS = 5;

  readonly numeroArchivos = computed(
    () => this.archivos().length + this.archivosPendientes().length
  );

  readonly espaciosDisponibles = computed(
    () => Math.max(
      0,
      this.MAX_ARCHIVOS - this.numeroArchivos()
    )
  );

  readonly puedeSeguirAgregandoArchivos = computed(
    () => this.espaciosDisponibles() > 0
  );

  ngOnInit(): void {
    const tesisId = this.tesisId();
    const expedienteId = this.expedienteId();

    if (!tesisId || !expedienteId) {
      this.notificationService.showError(
        'Los parámetros de la ruta no son válidos.'
      );
      return;
    }

    this.cargarDatos(tesisId, expedienteId);
  }

  private obtenerExpedienteId(): number | null {
    const id = this.route.snapshot.paramMap.get('expedienteId');

    if (!id || !/^[1-9]\d*$/.test(id)) {
      return null;
    }

    const parsedId = Number(id);

    return Number.isSafeInteger(parsedId) ? parsedId : null;
  }

  private cargarDatos(tesisId: string, expedienteId: number): void {
    this.loading.set(true);
    this.connectionError.set(false);

    forkJoin({
      tesis: this.tesisService.getById(tesisId),
      expediente: this.expedienteService.obtenerPorId(expedienteId),
    }).subscribe({
      next: ({ tesis, expediente }) => {
        this.tesis.set(tesis.data);
        localStorage.setItem('tesisSeleccionada', JSON.stringify(tesis.data));

        this.expediente.set(expediente.data);
        localStorage.setItem('expedienteSeleccionado', JSON.stringify(expediente.data));

        this.archivos.set(
          expediente.data.archivos.map(archivo => ({ ...archivo }))
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);

        if (err.status === 0) {
          this.connectionError.set(true);
          return;
        }

        this.notificationService.showError(
          'No se pudo cargar la información del expediente.'
        );
      },
    });
  }

  volverATesis(): void {
    const id = this.tesisId();

    if (id) {
      this.router.navigate(['/tesis', 'detalle', id]);
    }
  }

  abrirEdicion(): void {
    if (this.expediente() !== null) {
      this.modalAddEdit()?.abrirEdicionDesdeDetalle(this.expediente()!);
    }
  }

  actualizarExpediente(expedienteActualizado: Expediente): void {
    this.expediente.update(exp =>
      exp
        ? {
          ...exp,
          numeroExpediente: expedienteActualizado.numeroExpediente,
          numRevision: expedienteActualizado.numRevision,
          fechaAsociacion: expedienteActualizado.fechaAsociacion
        }
        : null
    );

    localStorage.setItem('expedienteSeleccionado', JSON.stringify(this.expediente()));    
  }

  mostrarPdf(ruta: string | null): void {
    if (!ruta) return;

    // Abrimos la pestaña SÍNCRONAMENTE para que el navegador no la bloquee
    const win = window.open('', '_blank');

    this.fileService.descargarPdf(ruta).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);

        if (win) {
          win.location.href = url;
        } else {
          // Fallback si el popup fue bloqueado
          window.open(url, '_blank');
        }

        // ⚠️ NO revoques inmediatamente: la pestaña aún está cargando el blob.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        win?.close();
        console.error('Error al abrir el PDF:', err);
        this.notificationService.showError('No se pudo abrir el archivo.');
      }
    });
  }

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivosSeleccionados = Array.from(input.files ?? []);

    if (archivosSeleccionados.length === 0) {
      return;
    }

    this.agregarArchivos(archivosSeleccionados);

    // Permite volver a seleccionar los mismos archivos.
    input.value = '';
  }

  permitirArrastre(event: DragEvent): void {
    event.preventDefault();
  }

  soltarArchivos(event: DragEvent): void {
    event.preventDefault();

    const archivos = Array.from(event.dataTransfer?.files ?? []);

    this.agregarArchivos(archivos);
  }

  private agregarArchivos(archivos: File[]): void {
    const MAX_SIZE = 10 * 1024 * 1024;

    const nuevos = [...this.archivosPendientes()];

    const archivosRegistrados = this.archivos().length;

    let agregados = 0;
    let limiteAvisado = false;

    for (const archivo of archivos) {
      // 1. Validar que sea PDF.
      const esPdf =
        archivo.type === 'application/pdf' &&
        archivo.name.toLowerCase().endsWith('.pdf');

      if (!esPdf) {
        this.notificationService.showError(
          `${archivo.name}: el archivo debe ser un PDF.`
        );
        continue;
      }

      // 2. Validar el tamaño máximo.
      if (archivo.size > MAX_SIZE) {
        this.notificationService.showError(
          `${archivo.name}: supera el límite de 10 MB.`
        );
        continue;
      }

      // 3. Evitar archivos duplicados en la lista pendiente.
      const duplicado = nuevos.some(
        existente =>
          existente.name === archivo.name &&
          existente.size === archivo.size &&
          existente.lastModified === archivo.lastModified
      );

      if (duplicado) {
        continue;
      }

      // 4. Comprobar el límite total de archivos.
      const totalActual = archivosRegistrados + nuevos.length;

      if (totalActual >= this.MAX_ARCHIVOS) {
        if (!limiteAvisado) {
          this.notificationService.showWarn(
            `Solo se permiten ${this.MAX_ARCHIVOS} archivos PDF por expediente. ` +
            `Ya tienes ${totalActual} archivos.`
          );

          limiteAvisado = true;
        }

        break;
      }

      // 5. Agregar el archivo si todavía hay espacio.
      nuevos.push(archivo);
      agregados++;
    }

    if (agregados > 0) {
      this.archivosPendientes.set(nuevos);
    }
  }

  persistirArchivo(index: number): void {
    const archivo = this.archivosPendientes()[index];
    const expedienteId = this.expedienteId();

    if (!archivo || expedienteId == null) {
      this.notificationService.showError(
        'No se encontró el archivo o el expediente.'
      );
      return;
    }

    this.loading.set(true);

    const formData = new FormData();
    formData.append('expedienteId', expedienteId.toString());
    formData.append('archivo', archivo);

    this.expedienteService.registrarArchivo(formData).subscribe({
      next: (res) => {
        this.loading.set(false);

        this.notificationService.showSuccess(
          res.message || 'Archivo registrado correctamente'
        );

        // Quitar el archivo pendiente después de registrarlo.
        this.archivosPendientes.update(
          archivos => archivos.filter((_, i) => i !== index)
        );

        // Actualizar la lista de archivos registrados.
        this.reloadDocuments();
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.showError(
          'No se pudo registrar el archivo.'
        );
      }
    });
  }

  quitarArchivoPendiente(index: number): void {
    this.archivosPendientes.update(
      archivos => archivos.filter((_, i) => i !== index)
    );
  }

  eliminarArchivo(archivo: ExpedienteArchivo): void {
    this.confirmAction.selectedItem.set(archivo);
    this.confirmAction.selectedAction.set('delete');
    const mensaje = `el archivo ${archivo.nombreArchivo} de este expediente`;
    this.confirmModal()?.abrir('delete', mensaje);
  }

  ejecutarAccionConfirmada(_motivo?: string | void): void {
    const archivo = this.confirmAction.selectedItem();
    const action = this.confirmAction.selectedAction();

    if (!archivo) return;

    // Activamos el spinner en el botón de confirmación
    this.confirmModal()?.loading.set(true);

    let request$;
    switch (action) {
      case 'delete':
        request$ = this.expedienteService.eliminarArchivo(archivo.id);
        break;
      default:
        request$ = this.expedienteService.eliminarArchivo(archivo.id);
        break;
    }

    request$.subscribe({
      next: (res) => {
        this.notificationService.showSuccess(res.message || 'Archivo eliminado del expediente.');
        this.confirmModal()?.cerrar();
        this.reloadDocuments();
      },
      error: () => this.confirmModal()?.loading.set(false)
    });
  }

  async copiarNumero(numero: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(numero);
    } catch {
      this.notificationService.showError(
        'No se pudo copiar el número del expediente.'
      );
    }
  }

  continuarSiguientePaso(): void {
    if (this.archivosPendientes().length > 0) {
      this.notificationService.showError('Aun tiene archivos pendientes de guardar');
      return;
    }

    this.router.navigate([
      '/tesis',
      'detalle',
      this.tesisId(),
      'expediente',
      this.expedienteId(),
      'comision'
    ]);
  }

  reloadDocuments() {
    if (this.expedienteId()) {
      this.cargarArchivos(this.expedienteId());
    }
  }

  cargarArchivos(expedienteId: number | null) {
    if (expedienteId != null) {
      this.loading.set(true);

      this.expedienteService.obtenerArchivosPorExpediente(expedienteId).subscribe({
        next: (res) => {
          this.archivos.set(res.data);
          this.loading.set(false);
        }
      })
    }
  }

}