import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesisDetalleComponent } from './tesis-detalle.component';

describe('TesisDetalleComponent', () => {
  let component: TesisDetalleComponent;
  let fixture: ComponentFixture<TesisDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesisDetalleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TesisDetalleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
