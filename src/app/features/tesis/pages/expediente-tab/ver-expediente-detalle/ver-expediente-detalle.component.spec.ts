import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerExpedienteDetalleComponent } from './ver-expediente-detalle.component';

describe('VerExpedienteDetalleComponent', () => {
  let component: VerExpedienteDetalleComponent;
  let fixture: ComponentFixture<VerExpedienteDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerExpedienteDetalleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerExpedienteDetalleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
