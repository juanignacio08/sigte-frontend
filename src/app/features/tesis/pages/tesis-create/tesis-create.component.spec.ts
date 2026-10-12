import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesisCreateComponent } from './tesis-create.component';

describe('TesisCreateComponent', () => {
  let component: TesisCreateComponent;
  let fixture: ComponentFixture<TesisCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesisCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TesisCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
