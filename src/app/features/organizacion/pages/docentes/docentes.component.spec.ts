import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DocentesComponent } from './docentes.component';
import { DocenteService } from '../../service/docente.service';
import { DepartamentoService } from '../../service/departamento.service';
import { EscuelaService } from '../../service/escuela.service';
import { TablaMaestraService } from '../../../configuracion/services/tabla-maestra.service';

describe('DocentesComponent', () => {
  let component: DocentesComponent;
  let fixture: ComponentFixture<DocentesComponent>;
  let docenteServiceMock: { getByFilters: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    docenteServiceMock = {
      getByFilters: vi.fn((_filtro, page, size) => of({
        data: [],
        totalItems: 25,
        totalPages: 3,
        currentPage: page,
        size,
        isFirst: page === 0,
        isLast: page === 2,
        message: '',
        status: '',
        code: ''
      }))
    };

    await TestBed.configureTestingModule({
      imports: [DocentesComponent],
      providers: [
        { provide: DocenteService, useValue: { ...docenteServiceMock, getMetricsByFacultad: () => of({ data: {} }) } },
        { provide: DepartamentoService, useValue: { getActivesByFacultad: () => of({ data: [] }) } },
        { provide: EscuelaService, useValue: { getActivesByFacultad: () => of({ data: [] }) } },
        { provide: TablaMaestraService, useValue: { getItemsActives: () => of({ data: [] }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requests the next page and updates pagination metadata', () => {
    component.paginaSiguiente();

    expect(docenteServiceMock.getByFilters).toHaveBeenLastCalledWith(component.filtro, 1, 10);
    expect(component.paginaActual()).toBe(1);
    expect(component.totalPaginas()).toBe(3);
    expect(component.totalItems()).toBe(25);
  });
});
