import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';

@Component({
  imports: [CommonModule, SkeletonModule],
  selector: 'app-table-skeleton',
  styleUrl: './table-skeleton.component.css',
  templateUrl: './table-skeleton.component.html',
})
export class TableSkeletonComponent {
  // Entradas mediante Signals (Angular 18+)
  rows = input<number>(5);    // Cantidad de filas a renderizar (por defecto 5)
  cols = input<number>(4);    // Cantidad de columnas a renderizar (por defecto 4)

  // Generadores de arreglos para usar en las directivas @for
  protected get rowArray(): () => number[] {
    return () => Array(this.rows()).fill(0);
  }

  protected get columnArray(): () => number[] {
    return () => Array(this.cols()).fill(0);
  }
}
