import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerarResolucionProyectoComponent } from './generar-resolucion-proyecto.component';

describe('GenerarResolucionProyectoComponent', () => {
  let component: GenerarResolucionProyectoComponent;
  let fixture: ComponentFixture<GenerarResolucionProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarResolucionProyectoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerarResolucionProyectoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
