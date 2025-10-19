import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocteursComponent } from './docteurs.component';

describe('DocteursComponent', () => {
  let component: DocteursComponent;
  let fixture: ComponentFixture<DocteursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocteursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocteursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
