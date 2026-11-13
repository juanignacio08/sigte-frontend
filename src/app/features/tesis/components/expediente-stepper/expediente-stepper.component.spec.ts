import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteStepperComponent } from './expediente-stepper.component';

describe('ExpedienteStepperComponent', () => {
  let component: ExpedienteStepperComponent;
  let fixture: ComponentFixture<ExpedienteStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteStepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteStepperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
