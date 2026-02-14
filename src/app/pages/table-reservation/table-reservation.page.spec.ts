import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableReservationPage } from './table-reservation.page';

describe('TableReservationPage', () => {
  let component: TableReservationPage;
  let fixture: ComponentFixture<TableReservationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TableReservationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
