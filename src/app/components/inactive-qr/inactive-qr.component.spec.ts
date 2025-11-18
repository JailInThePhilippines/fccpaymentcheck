import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveQrComponent } from './inactive-qr.component';

describe('InactiveQrComponent', () => {
  let component: InactiveQrComponent;
  let fixture: ComponentFixture<InactiveQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveQrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
