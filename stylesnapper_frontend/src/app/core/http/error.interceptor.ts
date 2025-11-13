import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * ErrorInterceptor
 * Normalizes API errors, logs them, and rethrows to the caller with a simplified shape.
 */
// PUBLIC_INTERFACE
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      let normalized: { status?: number; message: string; details?: any } = {
        message: 'An unexpected error occurred.',
      };

      if (err instanceof HttpErrorResponse) {
        const status = err.status;
        let message = 'Request failed';
        const details = err.error;

        if (typeof details === 'string') {
          message = details;
        } else if (details && typeof details === 'object') {
          message = (details.message as string) || (details.error as string) || message;
        } else if (err.message) {
          message = err.message;
        }

        normalized = { status, message, details };
      } else if (err && typeof err === 'object' && 'message' in (err as any)) {
        normalized.message = String((err as any).message);
      }

      // Surface in console for now; can be integrated with a toast/telemetry service
      console.error('[API Error]', {
        url: req.url,
        method: req.method,
        ...normalized,
      });

      return throwError(() => normalized);
    })
  );
};
