import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteAddEditComponent } from './expediente-add-edit.component';

describe('ExpedienteAddEditComponent', () => {
  let component: ExpedienteAddEditComponent;
  let fixture: ComponentFixture<ExpedienteAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
