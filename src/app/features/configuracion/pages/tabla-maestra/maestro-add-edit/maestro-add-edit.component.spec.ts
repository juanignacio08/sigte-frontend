import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaestroAddEditComponent } from './maestro-add-edit.component';

describe('MaestroAddEditComponent', () => {
  let component: MaestroAddEditComponent;
  let fixture: ComponentFixture<MaestroAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaestroAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MaestroAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
