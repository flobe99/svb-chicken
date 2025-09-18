import { Routes } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { OrderGuard } from './guards/order.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'order',
    loadComponent: () => import('./pages/order/order.page').then(m => m.OrderPage)
  },
  {
    path: 'order-overview',
    loadComponent: () => import('./pages/order-overview/order-overview.page').then(m => m.OrderOverviewPage),
    canActivate: [OrderGuard]
  },
  {
    path: 'order-verification',
    loadComponent: () => import('./pages/order-verification/order-verification.page').then(m => m.OrderVerificationPage),
    canActivate: [OrderGuard]
  },
  {
    path: 'order-feedback',
    loadComponent: () => import('./pages/order-feedback/order-feedback.page').then(m => m.OrderFeedbackPage),
    canActivate: [OrderGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/order/order.page').then(m => m.OrderPage)
  },
];
