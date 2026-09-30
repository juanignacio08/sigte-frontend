import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscuelaAddEditComponent } from './escuela-add-edit.component';

describe('EscuelaAddEditComponent', () => {
  let component: EscuelaAddEditComponent;
  let fixture: ComponentFixture<EscuelaAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscuelaAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscuelaAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
