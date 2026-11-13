import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-global-loading',
  styleUrl: './global-loading.component.css',
  templateUrl: './global-loading.component.html',
})
export class GlobalLoadingComponent {
  visible = input<boolean>(false);
  message = input<string>('Procesando solicitud...');

}
