import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@openng/optimus-ui/button';

@Component({
  imports: [CommonModule, ButtonModule],
  selector: 'app-no-connection',
  styleUrl: './no-connection.component.css',
  templateUrl: './no-connection.component.html',
})
export class NoConnectionComponent {
  // Configuración de textos personalizables vía inputs
  titulo = input<string>('Sin Conexión con el Servidor');
  mensaje = input<string>('No se pudo establecer comunicación con el backend. Verifica tu conexión a internet o reintenta en unos momentos.');

  reloadPage(): void {
    window.location.reload();
  }
}
