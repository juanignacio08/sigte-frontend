import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlantillaAddEditComponent } from './plantilla-add-edit.component';

describe('PlantillaAddEditComponent', () => {
  let component: PlantillaAddEditComponent;
  let fixture: ComponentFixture<PlantillaAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantillaAddEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaAddEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
