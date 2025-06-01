import { TestBed } from '@angular/core/testing';

import { TypeaheadModalService } from './typeahead.service';

describe('TypeaheadService', () => {
  let service: TypeaheadModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeaheadModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
