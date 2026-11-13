import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaMaestraComponent } from './tabla-maestra.component';

describe('TablaMaestraComponent', () => {
  let component: TablaMaestraComponent;
  let fixture: ComponentFixture<TablaMaestraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaMaestraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaMaestraComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
