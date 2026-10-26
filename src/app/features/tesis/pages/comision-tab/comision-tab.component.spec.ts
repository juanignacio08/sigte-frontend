import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComisionTabComponent } from './comision-tab.component';

describe('ComisionTabComponent', () => {
  let component: ComisionTabComponent;
  let fixture: ComponentFixture<ComisionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComisionTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComisionTabComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
