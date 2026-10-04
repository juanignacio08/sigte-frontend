import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocenteEditComponent } from './docente-edit.component';

describe('DocenteEditComponent', () => {
  let component: DocenteEditComponent;
  let fixture: ComponentFixture<DocenteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocenteEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocenteEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
