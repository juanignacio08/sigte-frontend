import { TestBed } from '@angular/core/testing';
import { TesisDocumentoService } from './tesis-documento.service';

describe('TesisDocumentoService', () => {
  let service: TesisDocumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TesisDocumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
