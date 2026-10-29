import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NoConnectionComponent } from '../../../../../shared/components/no-connection/no-connection.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { ExpedienteStepperComponent } from '../../../components/expediente-stepper/expediente-stepper.component';
import { ExpedienteWizardStore } from '../expediente-wizard.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  imports: [
    CommonModule,
    RouterOutlet,
    NoConnectionComponent,
    LoadingSpinnerComponent,
    ExpedienteStepperComponent
  ],
  selector: 'app-expediente-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExpedienteWizardStore],
  styleUrl: './expediente-wizard.component.css',
  templateUrl: './expediente-wizard.component.html',
})
export class ExpedienteWizardComponent implements OnInit {

  protected readonly store = inject(ExpedienteWizardStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Steps en orden (para calcular actual/siguiente/anterior)
  private readonly steps = [
    { key: 'datos', label: 'Datos', index: 1 },
    { key: 'comision', label: 'Comisión', index: 2 },
    { key: 'memorando', label: 'Memorando', index: 3 },
    { key: 'envio', label: 'Envío', index: 4 },
    { key: 'dictamen', label: 'Dictamen', index: 5 },
    { key: 'resolucion', label: 'Resolución', index: 6 },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url),  // 👈 valor inicial
    ),
    { initialValue: this.router.url },
  );

  readonly pasoActual = computed(() => {
    const url = this.currentUrl();

    if (url.endsWith('/comision')) return 2;
    if (url.endsWith('/memorando')) return 3;
    if (url.endsWith('/envio')) return 4;
    if (url.endsWith('/dictamen')) return 5;
    if (url.endsWith('/resolucion')) return 6;
    return 1;
  });

  readonly puedeIrAtras = computed(() => this.pasoActual() > 1);
  readonly puedeIrAdelante = computed(() => this.pasoActual() < 6);

  ngOnInit(): void {
    const tesisId = this.route.snapshot.paramMap.get('tesisId');
    const expedienteId = Number(this.route.snapshot.paramMap.get('expedienteId'));

    if (!tesisId || Number.isNaN(expedienteId)) {
      this.router.navigate(['/tesis']);
      return;
    }

    this.store.cargar(tesisId, expedienteId).subscribe({
      error: () => { /* el error ya está en el store */ },
    });
  }
}