import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThekePage } from './theke.page';

describe('ThekePage', () => {
  let component: ThekePage;
  let fixture: ComponentFixture<ThekePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ThekePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
