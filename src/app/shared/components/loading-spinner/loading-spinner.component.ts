import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loading-spinner',
  styleUrl: './loading-spinner.component.css',
  templateUrl: './loading-spinner.component.html',
})
export class LoadingSpinnerComponent {
  // Input opcional para personalizar el mensaje desde el componente padre
  message = input<string>('Cargando información, por favor espere...');
}
