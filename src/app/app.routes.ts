import { Routes } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { OrderGuard } from './guards/order.guard';
import { loginGuard, logoutGuard } from './guards/login.guard';

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
    path: 'order/:orderId',
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
    path: 'add-reservation',
    loadComponent: () => import('./pages/add-reservation/add-reservation.page').then( m => m.AddReservationPage)
  },
  {
    path: 'add-reservation/:id',
    loadComponent: () => import('./pages/add-reservation/add-reservation.page').then( m => m.AddReservationPage)
  },
  {
    path: 'table-reservation',
    loadComponent: () => import('./pages/table-reservation/table-reservation.page').then(m => m.TableReservationPage)
  },
  {
    path: 'theke',
    loadComponent: () => import('./pages/theke/theke.page').then(m => m.ThekePage),
    canActivate: [loginGuard]
  },
  {
    path: 'kitchen',
    loadComponent: () => import('./pages/kitchen/kitchen.page').then(m => m.KitchenPage),
    canActivate: [loginGuard]
  },

  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [loginGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [logoutGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/order/order.page').then(m => m.OrderPage)
  },
];
