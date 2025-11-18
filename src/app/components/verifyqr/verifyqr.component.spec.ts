import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyqrComponent } from './verifyqr.component';

describe('VerifyqrComponent', () => {
  let component: VerifyqrComponent;
  let fixture: ComponentFixture<VerifyqrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyqrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyqrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
