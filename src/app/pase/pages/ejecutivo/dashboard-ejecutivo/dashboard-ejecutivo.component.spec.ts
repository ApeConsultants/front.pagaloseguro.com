import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEjecutivoComponent } from './dashboard-ejecutivo.component';

describe('DashboardEjecutivoComponent', () => {
  let component: DashboardEjecutivoComponent;
  let fixture: ComponentFixture<DashboardEjecutivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEjecutivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEjecutivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
