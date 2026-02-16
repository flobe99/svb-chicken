import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddReservationPage } from './add-reservation.page';

describe('AddReservationPage', () => {
  let component: AddReservationPage;
  let fixture: ComponentFixture<AddReservationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReservationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
