import { Component, inject } from '@angular/core';
import { SidebarService } from '../sidebar/services/sidebar.service';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  sidebarService = inject(SidebarService);

  usuario = {
    nombre: 'Mesa de Partes',
    rol: 'Administrador FCS',
    iniciales: 'MP'
  };
}
