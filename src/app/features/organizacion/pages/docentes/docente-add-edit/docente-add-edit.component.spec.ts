import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocenteAddEditComponent } from './docente-add-edit.component';

describe('DocenteAddEditComponent', () => {
  let component: DocenteAddEditComponent;
  let fixture: ComponentFixture<DocenteAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocenteAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocenteAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
