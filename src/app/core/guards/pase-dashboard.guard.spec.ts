import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { paseDashabordGuard } from './pase-dashabord.guard';

describe('paseDashabordGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => paseDashabordGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
