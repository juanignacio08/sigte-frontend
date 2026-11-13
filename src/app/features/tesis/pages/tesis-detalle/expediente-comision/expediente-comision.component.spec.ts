import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteComisionComponent } from './expediente-comision.component';

describe('ExpedienteComisionComponent', () => {
  let component: ExpedienteComisionComponent;
  let fixture: ComponentFixture<ExpedienteComisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteComisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteComisionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
