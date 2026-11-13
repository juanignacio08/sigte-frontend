import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-app-empty-state',
  styleUrl: './app-empty-state.component.css',
  templateUrl: './app-empty-state.component.html',
})
export class AppEmptyStateComponent {
  title = input<string>('No se encontraron registros');
  description = input<string>('No hay elementos disponibles en este momento o no coinciden con los filtros aplicados.');
  icon = input<string>('pi pi-folder-open');
  buttonText = input<string>('Registrar Nuevo Proyecto');
  showButton = input<boolean>(true);

  // Output que avisa al componente padre
  onAdd = output<void>();
}
