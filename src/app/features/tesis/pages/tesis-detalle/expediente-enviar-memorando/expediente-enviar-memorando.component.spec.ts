import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedientoEnviarMemorandoComponent } from './expediento-enviar-memorando.component';

describe('ExpedientoEnviarMemorandoComponent', () => {
  let component: ExpedientoEnviarMemorandoComponent;
  let fixture: ComponentFixture<ExpedientoEnviarMemorandoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedientoEnviarMemorandoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedientoEnviarMemorandoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
