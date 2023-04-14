import { TestBed } from '@angular/core/testing';

import { DeedhubService } from './deedhub.service';

describe('DeedhubService', () => {
  let service: DeedhubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeedhubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
