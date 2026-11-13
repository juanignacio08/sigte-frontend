import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantillaDocumentoService } from '../../../service/plantilla-documento.service';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { FileService } from '../../../../../shared/services/file.service';
import { PlantillaAddEditComponent } from '../plantilla-add-edit/plantilla-add-edit.component';
import { ConfirmActionType, ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PlantillaDocumento, TipoDocumentoOpcion } from '../../../../../shared/models/master/plantilla-documento.model';
import { TablaMaestraService } from '../../../../configuracion/services/tabla-maestra.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { TableSkeletonComponent } from '../../../../../shared/components/table-skeleton/table-skeleton.component';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';

@Component({
  imports: [ButtonComponent, TableSkeletonComponent, NoConnectionComponent, PlantillaAddEditComponent, ConfirmDialogComponent],
  selector: 'app-escuela-plantillas',
  styleUrl: './escuela-plantillas.component.css',
  templateUrl: './escuela-plantillas.component.html',
})
export class EscuelaPlantillasComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly plantillaService = inject(PlantillaDocumentoService);
  private readonly notificationService = inject(NotificacionService);
  private readonly fileService = inject(FileService);

  readonly modalPlantilla = viewChild<PlantillaAddEditComponent>('modalPlantilla');
  readonly confirmModal = viewChild<ConfirmDialogComponent>('confirmModal');

  readonly escuelaId = signal<number | null>(null);
  readonly escuelaNombre = signal('Escuela Profesional');

  readonly plantillas = signal<PlantillaDocumento[]>([]);

  readonly loading = signal(false);
  readonly connectionError = signal(false);

  readonly cargandoOperacion = signal(false);

  readonly tiposDocumento = signal<TipoDocumentoOpcion[]>([]);

  readonly confirmAction = {
    selectedItem: signal<PlantillaDocumento | null>(null),
    selectedAction: signal<ConfirmActionType>('delete')
  };

  readonly totalPlantillas = computed(
    () => this.plantillas().length
  );

  readonly plantillasActivas = computed(
    () => this.plantillas().filter(p => p.estado === 1).length
  );

  readonly plantillasInactivas = computed(
    () => this.plantillas().filter(p => p.estado === 0).length
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('escuelaId'));

    if (!id || isNaN(id)) {
      this.notificationService.showError('No se recibió una escuela válida.');
      this.volver();
      return;
    }

    this.escuelaId.set(id);

    const escuela = history.state?.escuela;

    if (escuela?.denominacion) {
      this.escuelaNombre.set(escuela.denominacion);
    }

    this.cargarPlantillas(id);
    this.cargarTiposDocumento();
  }

  cargarPlantillas(escuelaId: number): void {
    this.loading.set(true);
    this.connectionError.set(false);

    this.plantillaService.listarPorEscuela(escuelaId).subscribe({
      next: (res) => {
        this.plantillas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.connectionError.set(true);
          return;
        }
        this.notificationService.showError(
          'No se pudieron cargar las plantillas de la escuela.'
        );
      }
    });
  }

  cargarTiposDocumento(): void {
    this.tiposDocumento.set([
      { codigo: TablaMaestraService.documentTypeProjectMemorandum, denominacion: 'Memorando de Proyecto de tesis' },
      { codigo: TablaMaestraService.documentTypeDraftMemorandum, denominacion: 'Memorando de Borrador de tesis' },
      { codigo: TablaMaestraService.documentTypeProjectResolution, denominacion: 'Resolución de Aprobación de Proyecto' },
      { codigo: TablaMaestraService.documentTypeDraftResolution, denominacion: 'Resolución de Fecha y Hora' },
    ]);
  }

  nuevaPlantilla(): void {
    this.modalPlantilla()?.abrirRegistro();
  }

  editarPlantilla(plantilla: PlantillaDocumento): void {
    this.modalPlantilla()?.abrirEdicion(plantilla);
  }

  eliminarPlantilla(plantilla: PlantillaDocumento): void {
    this.confirmAction.selectedItem.set(plantilla);
    this.confirmAction.selectedAction.set('delete');

    this.confirmModal()?.abrir(
      'delete',
      plantilla.tipoDocumentoDenominacion
    );
  }

  ejecutarAccionConfirmada(): void {
    const plantilla = this.confirmAction.selectedItem();

    if (!plantilla) return;

    this.confirmModal()?.loading.set(true);

    this.plantillaService.eliminar(plantilla.id).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(
          res.message || 'Plantilla eliminada correctamente.'
        );
        this.confirmModal()?.cerrar();
        const escuelaId = this.escuelaId();
        if (escuelaId) {
          this.cargarPlantillas(escuelaId);
        }
      },
      error: (err) => {
        this.confirmModal()?.loading.set(false);

        this.notificationService.showError(
          err?.error?.message || 'No se pudo eliminar la plantilla.'
        );
      }
    });
  }

  onGuardadoExitoso(): void {
    const escuelaId = this.escuelaId();
    if (escuelaId) {
      this.cargarPlantillas(escuelaId);
    }
  }

  obtenerPlazo(plantilla: PlantillaDocumento): string {
    if (plantilla.plazoDias != null) {
      return `${plantilla.plazoDias} ${plantilla.plazoDias === 1 ? 'día' : 'días'}`;
    }

    if (plantilla.plazoMeses != null) {
      return `${plantilla.plazoMeses} ${plantilla.plazoMeses === 1 ? 'mes' : 'meses'}`;
    }

    return 'Sin plazo definido';
  }

  descargarPlantilla(plantilla: PlantillaDocumento): void {
    if (!plantilla.archivoUrl) {
      this.notificationService.showInfo('La plantilla no tiene un archivo asociado.');
      return;
    }

    const ruta = plantilla.archivoUrl;

    this.fileService.descargarPlantilla(ruta).subscribe({
      next: (blob: Blob) => {
        // Crear un objeto URL para forzar la descarga en el navegador
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = plantilla.nombreDocumento;
        document.body.appendChild(a);
        a.click();

        // Limpiar recurso de memoria
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar la plantilla:', err);
        this.notificationService.showError('No se pudo descargar el archivo.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/organizacion/escuelas']);
  }
}
