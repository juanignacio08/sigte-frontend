import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesisCardComponent } from './tesis-card.component';

describe('TesisCardComponent', () => {
  let component: TesisCardComponent;
  let fixture: ComponentFixture<TesisCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesisCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TesisCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
