import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TitleSubtitleComponent } from './title-subtitle.component';

describe('TitleSubtitleComponent', () => {
  let component: TitleSubtitleComponent;
  let fixture: ComponentFixture<TitleSubtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleSubtitleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TitleSubtitleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
