import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificacionService } from '../../../../../../shared/services/notificacion.service';
import { TesisDocumentoService } from '../../../../services/tesis-documento.service';
import { GenerarMemoModalComponent } from './generar-memo-modal.component';

describe('GenerarMemoModalComponent', () => {
  let component: GenerarMemoModalComponent;
  let fixture: ComponentFixture<GenerarMemoModalComponent>;
  const documentoServiceMock = {
    generarMemo: vi.fn(() => of({ message: 'Memorando generado' })),
  };
  const notificacionServiceMock = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarMemoModalComponent],
      providers: [
        { provide: TesisDocumentoService, useValue: documentoServiceMock },
        { provide: NotificacionService, useValue: notificacionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerarMemoModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tesisId', 'tesis-1');
    fixture.componentRef.setInput('expedienteId', 12);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the document title immediately when either form value changes', () => {
    component.formMemo.controls.numeroCorrelativo.setValue(316);
    expect(component.tituloMemo()).toBe(
      `Memorando Múltiple N° 316-${new Date().getFullYear()}-UNSCH-FCSA/D`
    );

    component.formMemo.controls.anio.setValue(2025);
    expect(component.tituloMemo()).toBe(
      'Memorando Múltiple N° 316-2025-UNSCH-FCSA/D'
    );
  });
});
