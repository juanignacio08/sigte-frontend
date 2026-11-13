import { Component, EventEmitter, input, Output } from '@angular/core';
import { Tesis } from '../../../../shared/models/tramites/tesis.model';
import { CommonModule } from '@angular/common';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';

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

  getBadgeEstadoClass(estado: string | undefined | null): string {
    const r = (estado ?? '').toUpperCase();
    if (r.includes(TablaMaestraService.stateFileInRegister)) return 'bg-sky-300 text-sky-900 border-sky-400';
    if (r.includes(TablaMaestraService.stateFileMemorandumGenerated)) return 'bg-green-300 text-green-900 border-green-400';
    if (r.includes(TablaMaestraService.stateFileMemorandumSent)) return 'bg-gray-300 text-gray-900 border-gray-400';
    if (r.includes(TablaMaestraService.stateFileDictamenApproved)) return 'bg-red-200 text-red-800 border-red-300';
    if (r.includes(TablaMaestraService.stateFileDictamenObservation)) return 'bg-yellow-200 text-yellow-900 border-yellow-300';
    if (r.includes(TablaMaestraService.stateFileApproved)) return 'bg-blue-200 text-blue-900 border-blue-300';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}
