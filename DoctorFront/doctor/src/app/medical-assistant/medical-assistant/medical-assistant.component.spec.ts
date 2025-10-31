import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalAssistantComponent } from './medical-assistant.component';

describe('MedicalAssistantComponent', () => {
  let component: MedicalAssistantComponent;
  let fixture: ComponentFixture<MedicalAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
