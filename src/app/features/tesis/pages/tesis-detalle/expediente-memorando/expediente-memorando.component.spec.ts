import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedienteMemorandoComponent } from './expediente-memorando.component';

describe('ExpedienteMemorandoComponent', () => {
  let component: ExpedienteMemorandoComponent;
  let fixture: ComponentFixture<ExpedienteMemorandoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteMemorandoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteMemorandoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
