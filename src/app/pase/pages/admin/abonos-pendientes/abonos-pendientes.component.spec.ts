import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonosPendientesComponent } from './abonos-pendientes.component';

describe('AbonosPendientesComponent', () => {
  let component: AbonosPendientesComponent;
  let fixture: ComponentFixture<AbonosPendientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbonosPendientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbonosPendientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
