import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscuelaProfesionalComponent } from './escuela-profesional.component';

describe('EscuelaProfesionalComponent', () => {
  let component: EscuelaProfesionalComponent;
  let fixture: ComponentFixture<EscuelaProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscuelaProfesionalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscuelaProfesionalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
