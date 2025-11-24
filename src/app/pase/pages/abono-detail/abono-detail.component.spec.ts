import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonoDetailComponent } from './abono-detail.component';

describe('AbonoDetailComponent', () => {
  let component: AbonoDetailComponent;
  let fixture: ComponentFixture<AbonoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbonoDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbonoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
