import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TablaMaestraService } from '../../../services/tabla-maestra.service';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { NotificacionService } from '../../../../../shared/services/notificacion.service';
import { MasterTable, MasterTableRequest } from '../../../../../shared/models/master/tabla_maestra.model';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

@Component({
  imports: [DialogModule, InputTextModule, ReactiveFormsModule, ButtonComponent, ToggleSwitchModule],
  selector: 'app-maestro-add-edit',
  styleUrl: './maestro-add-edit.component.css',
  templateUrl: './maestro-add-edit.component.html',
})
export class MaestroAddEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tablaMaestraService = inject(TablaMaestraService);
  private readonly notificationService = inject(NotificacionService);

  tableCode = input.required<string >();
  onSuccess = output<void>();

  visible = signal<boolean>(false);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  private currentCode: string | null = null;

  form: FormGroup = this.fb.group({
    tableCode: [{ value: '', disabled: true }, Validators.required, Validators.minLength(3), Validators.maxLength(3)],
    itemCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    denomination: ['', [Validators.required, Validators.maxLength(200)]],
    isSystem: [null]
  });

  abrirNuevo(): void {
    this.isEdit.set(false);
    this.currentCode = null;
    this.form.reset();
    this.form.patchValue({
      tableCode: this.tableCode()
    });
    this.visible.set(true);
  }

  abrirEdicion(item: MasterTable) {
    this.isEdit.set(true);
    this.currentCode = item.code;
    this.form.patchValue({
      tableCode: this.tableCode(),
      itemCode: item.itemCode,
      denomination: item.denomination,
      isSystem: item.isSystem
    });
    this.visible.set(true);

    console.log(this.form.get('isSystem')?.value);
    
  }

  cerrarModal(): void {
    this.form.reset();
    this.loading.set(false);
    this.isEdit.set(false);
    this.visible.set(false);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    const payload: MasterTableRequest = {
      ...this.form.getRawValue()
    };

    console.log(payload);
    

    // Petición al Backend (si es edición o creación)
    const request$ = this.isEdit() && this.currentCode
      ? this.tablaMaestraService.update(this.currentCode, payload) // Asegúrate de tener este método en tu servicio
      : this.tablaMaestraService.create(payload);                // Método para guardar

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.cerrarModal();

        this.notificationService.showSuccess(res.message);

        this.onSuccess.emit(); // Notifica al componente padre para refrescar la tabla
      },
      error: (err) => {
        console.error('Error al guardar el ítem:', err);
        this.loading.set(false);
      }
    });
  }

}
