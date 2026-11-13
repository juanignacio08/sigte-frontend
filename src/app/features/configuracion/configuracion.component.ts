import { Component } from '@angular/core';
import { OptionMenu } from '../../shared/models/utils/optionmenu.model';
import { TitleSubtitleComponent } from '../../shared/components/title-subtitle/title-subtitle.component';
import { CardOptionMenuComponent } from '../../shared/components/card-option-menu/card-option-menu.component';

@Component({
  imports: [TitleSubtitleComponent, CardOptionMenuComponent],
  selector: 'app-configuracion',
  styleUrl: './configuracion.component.css',
  templateUrl: './configuracion.component.html',
})
export class ConfiguracionComponent {
  optionsList : OptionMenu[] = [
    {
      id: 1,
      label: 'Datos Generales',
      icon: 'pi-database',
      navigateTo: '/configuracion/tabla-maestra'
    },
    {
      id: 2,
      label: 'Departamento Académico',
      icon: 'pi-database',
      navigateTo: '/configuration/academic_department'
    },
    {
      id: 3,
      label: 'Escuelas Profesionales',
      icon: 'pi-database',
      navigateTo: '/configuration/professional_school'
    },
  ]

}
