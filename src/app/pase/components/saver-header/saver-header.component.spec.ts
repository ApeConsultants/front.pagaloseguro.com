import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaverHeaderComponent } from './saver-header.component';

describe('SaverHeaderComponent', () => {
  let component: SaverHeaderComponent;
  let fixture: ComponentFixture<SaverHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaverHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaverHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
