import { TestBed } from '@angular/core/testing';
import { TesisExpedienteService } from './tesis-expediente.service';

describe('TesisExpedienteService', () => {
  let service: TesisExpedienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TesisExpedienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
