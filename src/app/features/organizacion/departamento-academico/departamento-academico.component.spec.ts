import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartamentoAcademicoComponent } from './departamento-academico.component';

describe('DepartamentoAcademicoComponent', () => {
  let component: DepartamentoAcademicoComponent;
  let fixture: ComponentFixture<DepartamentoAcademicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartamentoAcademicoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartamentoAcademicoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
