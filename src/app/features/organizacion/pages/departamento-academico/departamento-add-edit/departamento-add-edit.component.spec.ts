import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartamentoAddEditComponent } from './departamento-add-edit.component';

describe('DepartamentoAddEditComponent', () => {
  let component: DepartamentoAddEditComponent;
  let fixture: ComponentFixture<DepartamentoAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartamentoAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartamentoAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
