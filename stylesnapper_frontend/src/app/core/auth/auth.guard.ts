import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AppStore } from '../state/app-store.service';

/**
 * AuthGuard
 * Simple guard that allows access only if an auth token exists in the AppStore.
 * Redirects to /login if not authenticated.
 */
// PUBLIC_INTERFACE
export const authGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  const router = inject(Router);
  const token = store.authToken()();

  if (token) return true;

  return router.createUrlTree(['/login']) as UrlTree;
};
