import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoConnectionComponent } from './no-connection.component';

describe('NoConnectionComponent', () => {
  let component: NoConnectionComponent;
  let fixture: ComponentFixture<NoConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoConnectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NoConnectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
