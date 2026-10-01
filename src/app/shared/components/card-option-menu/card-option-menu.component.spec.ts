import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardOptionMenuComponent } from './card-option-menu.component';

describe('CardOptionMenuComponent', () => {
  let component: CardOptionMenuComponent;
  let fixture: ComponentFixture<CardOptionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOptionMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardOptionMenuComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
