import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscuelaProfesionalDepComponent } from './escuela-profesional-dep.component';

describe('EscuelaProfesionalDepComponent', () => {
  let component: EscuelaProfesionalDepComponent;
  let fixture: ComponentFixture<EscuelaProfesionalDepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscuelaProfesionalDepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscuelaProfesionalDepComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
