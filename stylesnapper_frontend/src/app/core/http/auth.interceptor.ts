import { HttpInterceptorFn } from '@angular/common/http';

/**
 * AuthInterceptor
 * Attaches a Bearer token to outgoing HTTP requests if a token is available.
 * Replace token retrieval logic with actual AuthService/localStorage as needed.
 */
// PUBLIC_INTERFACE
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Token retrieval placeholder; integrate with real auth later
  let token: string | null = null;

  try {
    // Prefer non-throwing access in SSR, avoid referencing DOM types in typings
    const g = globalThis as any;
    const storage = g && g.localStorage ? g.localStorage as any : undefined;
    token = typeof storage?.getItem === 'function' ? storage.getItem('auth_token') : null;
  } catch {
    token = null;
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
