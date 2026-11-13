import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteTabComponent } from './expediente-tab.component';

describe('ExpedienteTabComponent', () => {
  let component: ExpedienteTabComponent;
  let fixture: ComponentFixture<ExpedienteTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteTabComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
