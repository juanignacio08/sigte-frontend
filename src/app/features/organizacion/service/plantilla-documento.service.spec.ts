import { TestBed } from '@angular/core/testing';
import { PlantillaDocumentoService } from './plantilla-documento.service';

describe('PlantillaDocumentoService', () => {
  let service: PlantillaDocumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantillaDocumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
