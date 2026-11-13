import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteResolucionComponent } from './expediente-resolucion.component';

describe('ExpedienteResolucionComponent', () => {
  let component: ExpedienteResolucionComponent;
  let fixture: ComponentFixture<ExpedienteResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteResolucionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteResolucionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
