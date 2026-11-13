import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarDictamenComponent } from './registrar-dictamen.component';

describe('RegistrarDictamenComponent', () => {
  let component: RegistrarDictamenComponent;
  let fixture: ComponentFixture<RegistrarDictamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarDictamenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarDictamenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
