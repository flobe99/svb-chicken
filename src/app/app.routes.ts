import { Routes } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const routes: Routes = [
  {
    path: '**',
    redirectTo: 'mix',
    pathMatch: 'full',
  },
  {
    path: 'mix',
    loadComponent: () => import('./pages/mix/mix.page').then(m => m.MixPage),
  },
  {
    path: 'mix-status',
    loadComponent: () => import('./modals/mix-status/mix-status.page').then(m => m.MixStatusPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'add-recipes',
    loadComponent: () => import('./pages/addRecipes/addRecipes.page').then(m => m.AddRecipesPage)
  },
  {
    path: 'add-ingredients',
    loadComponent: () => import('./pages/addIngredients/addIngredients.page').then(m => m.AddIngredientsPage)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/mix/mix.page').then(m => m.MixPage)
  },

];