import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerDetalleEnvioComponent } from './ver-detalle-envio.component';

describe('VerDetalleEnvioComponent', () => {
  let component: VerDetalleEnvioComponent;
  let fixture: ComponentFixture<VerDetalleEnvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDetalleEnvioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerDetalleEnvioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
