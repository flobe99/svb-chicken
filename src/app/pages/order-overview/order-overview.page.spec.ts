import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderOverviewPage } from './order-overview.page';

describe('OrderOverviewPage', () => {
  let component: OrderOverviewPage;
  let fixture: ComponentFixture<OrderOverviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
