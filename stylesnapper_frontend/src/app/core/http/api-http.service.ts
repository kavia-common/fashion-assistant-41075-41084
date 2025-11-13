import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RuntimeConfigService } from '../config/runtime-config.service';

/**
 * ApiHttpService provides a thin wrapper over HttpClient that prefixes requests
 * with the API base URL from RuntimeConfigService (NG_APP_API_BASE).
 * It also exposes simple helper methods for common HTTP verbs.
 */
// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  constructor(
    private http: HttpClient,
    private runtimeConfig: RuntimeConfigService
  ) {}

  /** Resolve API base URL from runtime config; returns empty string if missing. */
  private get apiBase(): string {
    const base = this.runtimeConfig.get('NG_APP_API_BASE');
    // Normalize to avoid double slashes in concatenation
    return (base || '').replace(/\/+$/, '');
  }

  /** Join base with provided path, tolerating leading/trailing slashes. */
  private resolveUrl(path: string): string {
    // If path is absolute (http/https), don't prefix
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const normalizedPath = ('/' + (path || '')).replace(/\/{2,}/g, '/');
    return `${this.apiBase}${normalizedPath}`;
  }

  /** Build HttpClient options ensuring observe: 'body' | responseType: 'json' to get Observable<T>. */
  private buildOptions(options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    reportProgress?: boolean;
    withCredentials?: boolean;
  }) {
    return {
      ...(options || {}),
      observe: 'body' as const,
      responseType: 'json' as const,
    };
  }

  // PUBLIC_INTERFACE
  get<T>(path: string, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    reportProgress?: boolean;
    withCredentials?: boolean;
  }): Observable<T> {
    /** Performs a GET request against the API base + path. */
    const opts = this.buildOptions(options);
    return this.http.get<T>(this.resolveUrl(path), opts);
  }

  // PUBLIC_INTERFACE
  post<T>(path: string, body: unknown, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    reportProgress?: boolean;
    withCredentials?: boolean;
  }): Observable<T> {
    /** Performs a POST request against the API base + path. */
    const opts = this.buildOptions(options);
    return this.http.post<T>(this.resolveUrl(path), body, opts);
  }

  // PUBLIC_INTERFACE
  put<T>(path: string, body: unknown, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    reportProgress?: boolean;
    withCredentials?: boolean;
  }): Observable<T> {
    /** Performs a PUT request against the API base + path. */
    const opts = this.buildOptions(options);
    return this.http.put<T>(this.resolveUrl(path), body, opts);
  }

  // PUBLIC_INTERFACE
  patch<T>(path: string, body: unknown, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    reportProgress?: boolean;
    withCredentials?: boolean;
  }): Observable<T> {
    /** Performs a PATCH request against the API base + path. */
    const opts = this.buildOptions(options);
    return this.http.patch<T>(this.resolveUrl(path), body, opts);
  }

  // PUBLIC_INTERFACE
  delete<T>(path: string, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    reportProgress?: boolean;
    withCredentials?: boolean;
  }): Observable<T> {
    /** Performs a DELETE request against the API base + path. */
    const opts = this.buildOptions(options);
    return this.http.delete<T>(this.resolveUrl(path), opts);
  }
}
