import { TestBed } from '@angular/core/testing';

import { MultipleSelectionsService } from './multiple-selections.service';

describe('MultipleSelectionsService', () => {
  let service: MultipleSelectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultipleSelectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
