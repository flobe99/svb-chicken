import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderVerificationPage } from './order-verification.page';

describe('OrderVerificationPage', () => {
  let component: OrderVerificationPage;
  let fixture: ComponentFixture<OrderVerificationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderVerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
