import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesisComponent } from './tesis.component';

describe('TesisComponent', () => {
  let component: TesisComponent;
  let fixture: ComponentFixture<TesisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TesisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
