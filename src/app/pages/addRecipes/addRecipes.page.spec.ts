import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRecipesPage } from './addRecipes.page';

describe('SettingsPage', () => {
  let component: AddRecipesPage;
  let fixture: ComponentFixture<AddRecipesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecipesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
