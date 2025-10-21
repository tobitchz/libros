import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Translate } from './translate';

describe('Translate', () => {
  let service: Translate;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClient],
      providers: [Translate]
    });
    service = TestBed.inject(Translate);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });
});
