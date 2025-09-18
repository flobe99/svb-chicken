import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderFeedbackPage } from './order-feedback.page';

describe('OrderFeedbackPage', () => {
  let component: OrderFeedbackPage;
  let fixture: ComponentFixture<OrderFeedbackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderFeedbackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
