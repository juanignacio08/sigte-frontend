import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarMiembroComisionComponent } from './agregar-miembro-comision.component';

describe('AgregarMiembroComisionComponent', () => {
  let component: AgregarMiembroComisionComponent;
  let fixture: ComponentFixture<AgregarMiembroComisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarMiembroComisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarMiembroComisionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
