import { Component, inject, Input } from '@angular/core';
import { OptionMenu } from '../../models/utils/optionmenu.model';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-card-option-menu',
  styleUrl: './card-option-menu.component.css',
  templateUrl: './card-option-menu.component.html',
})
export class CardOptionMenuComponent {
  @Input() item ?: OptionMenu;

  private readonly router = inject(Router);

  navigateTo() {
    if (!this.item?.navigateTo) return; 
    
    this.router.navigate([this.item.navigateTo]);
  }

}
