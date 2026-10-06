import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstudianteAddEditComponent } from './estudiante-add-edit.component';

describe('EstudianteAddEditComponent', () => {
  let component: EstudianteAddEditComponent;
  let fixture: ComponentFixture<EstudianteAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudianteAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudianteAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
