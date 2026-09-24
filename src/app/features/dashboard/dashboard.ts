import { Component } from '@angular/core';
import { TitleSubtitleComponent } from '../../shared/components/title-subtitle/title-subtitle.component';

@Component({
  imports: [TitleSubtitleComponent],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  title = 'Dashboard General';
  subtitle = 'Bienvenido al Sistema de Gestión de Tesis FCS - UNSCH';
  icon = 'pi-objects-column';
}
