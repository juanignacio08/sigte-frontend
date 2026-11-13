import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscuelaPlantillasComponent } from './escuela-plantillas.component';

describe('EscuelaPlantillasComponent', () => {
  let component: EscuelaPlantillasComponent;
  let fixture: ComponentFixture<EscuelaPlantillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscuelaPlantillasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscuelaPlantillasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
