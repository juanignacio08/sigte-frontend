import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteFechaSustentacionComponent } from './expediente-fecha-sustentacion.component';

describe('ExpedienteFechaSustentacionComponent', () => {
  let component: ExpedienteFechaSustentacionComponent;
  let fixture: ComponentFixture<ExpedienteFechaSustentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteFechaSustentacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteFechaSustentacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
