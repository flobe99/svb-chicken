import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScanOrderPage } from './scan-order.page';

describe('ScanOrderPage', () => {
  let component: ScanOrderPage;
  let fixture: ComponentFixture<ScanOrderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
