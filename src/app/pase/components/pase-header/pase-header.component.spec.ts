import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaseHeaderComponent } from './pase-header.component';

describe('PaseHeaderComponent', () => {
  let component: PaseHeaderComponent;
  let fixture: ComponentFixture<PaseHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaseHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
