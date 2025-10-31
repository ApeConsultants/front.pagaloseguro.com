import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaseSidebarComponent } from './pase-sidebar.component';

describe('PaseSidebarComponent', () => {
  let component: PaseSidebarComponent;
  let fixture: ComponentFixture<PaseSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaseSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaseSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
