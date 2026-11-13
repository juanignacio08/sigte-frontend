import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal, Type } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from './services/sidebar.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  sidebarService = inject(SidebarService);
  isMobile = signal<boolean>(false);

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.updateScreenSize(window.innerWidth);
    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    // Simulamos la respuesta de la Base de Datos (los nombres llegan como string)
    this.menuItems = [
      { 
        label: 'Dashboard', 
        icon: 'pi-objects-column', 
        route: '/dashboard' 
      },
      { 
        label: 'Estructura Académica', 
        icon: 'pi-sitemap', 
        children: [
          {
            label: "Departamento Académicos",
            icon: "pi-building-columns",
            route: '/organizacion/departamentos',
          },
          {
            label: "Escuelas Profesionales",
            icon: "pi-building",
            route: '/organizacion/escuelas'
          }
        ],
        expanded: false
      },
      { 
        label: 'Docentes y Estudiantes', 
        icon: 'pi-users', 
        children: [
          {
            label: "Gestión de Docentes",
            icon: "pi-address-book",
            route: '/personal/docentes',
          },
          {
            label: "Gestión de Estudiantes",
            icon: "pi-address-book",
            route: '/personal/estudiantes'
          }
        ],
        expanded: false
      },
      { 
        label: 'Gestión de Tesis', 
        icon: 'pi-file', 
        children: [
          {
            label: "Listar Tesis",
            icon: "pi-address-book",
            route: '/tesis/listar',
          },
          {
            label: "Registrar Tesis",
            icon: "pi-address-book",
            route: '/tesis/registrar',
          },
        ],
        expanded: false 
      },
      // { label: 'Comisiones y Jurados', icon: 'pi-slack', route: '/comisiones' },
      // { label: 'Trámites y Resoluciones', icon: 'pi-clipboard', route: '/tramites' },
      // { label: 'Configuración', icon: 'pi-cog', route: '/configuracion' },
    ];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    this.updateScreenSize(width);
  }

  private updateScreenSize(width: number): void {
    const mobile = width < 1024; // Breakpoint lg de Tailwind
    
    // Si cambió de pantalla grande a móvil, cerramos automáticamente
    if (mobile && !this.isMobile()) {
      this.sidebarService.close();
    } 
    // Si cambió de móvil a pantalla grande, abrimos automáticamente
    else if (!mobile && this.isMobile()) {
      this.sidebarService.open();
    }

    this.isMobile.set(mobile);
  }

  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  closeOnMobile(): void {
    if (this.isMobile()) {
      this.sidebarService.close();
    }
  }
}