import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteDictamenComponent } from './expediente-dictamen.component';

describe('ExpedienteDictamenComponent', () => {
  let component: ExpedienteDictamenComponent;
  let fixture: ComponentFixture<ExpedienteDictamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteDictamenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteDictamenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
