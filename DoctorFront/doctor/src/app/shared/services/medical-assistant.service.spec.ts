import { TestBed } from '@angular/core/testing';

import { MedicalAssistantService } from './medical-assistant.service';

describe('MedicalAssistantService', () => {
  let service: MedicalAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalAssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
