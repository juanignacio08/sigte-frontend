import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnviarResolucionComponent } from './enviar-resolucion.component';

describe('EnviarResolucionComponent', () => {
  let component: EnviarResolucionComponent;
  let fixture: ComponentFixture<EnviarResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnviarResolucionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EnviarResolucionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
