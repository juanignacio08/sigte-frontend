import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteWizardComponent } from './expediente-wizard.component';

describe('ExpedienteWizardComponent', () => {
  let component: ExpedienteWizardComponent;
  let fixture: ComponentFixture<ExpedienteWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteWizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteWizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
