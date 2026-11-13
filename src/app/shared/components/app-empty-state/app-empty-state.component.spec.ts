import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppEmptyStateComponent } from './app-empty-state.component';

describe('AppEmptyStateComponent', () => {
  let component: AppEmptyStateComponent;
  let fixture: ComponentFixture<AppEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppEmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppEmptyStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
