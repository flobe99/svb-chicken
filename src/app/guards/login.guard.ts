import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  router.navigate(['dashboard']);
  return false;

};

export const logoutGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (!inject(AuthService).isLoggedIn()) {
    return true;
  }
  router.navigate(['dashboard']);
  return false;
};
