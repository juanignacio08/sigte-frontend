import { TestBed } from '@angular/core/testing';
import { TesisComisionService } from './tesis-comision.service';

describe('TesisComisionService', () => {
  let service: TesisComisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TesisComisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
