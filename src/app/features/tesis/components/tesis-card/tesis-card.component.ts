import { Component, EventEmitter, input, Output } from '@angular/core';
import { Tesis } from '../../../../shared/models/tramites/tesis.model';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-tesis-card',
  styleUrl: './tesis-card.component.css',
  templateUrl: './tesis-card.component.html',
})
export class TesisCardComponent {
  tesis = input<Tesis | null>(null);
  @Output() onClick = new EventEmitter<Tesis>();

  verDetalle(id: string) {}
}
