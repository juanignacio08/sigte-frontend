import { TestBed } from '@angular/core/testing';
import { TablaMaestraService } from './tabla-maestra.service';

describe('TablaMaestraService', () => {
  let service: TablaMaestraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaMaestraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
