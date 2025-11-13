import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { ApiHttpService } from '../http/api-http.service';
import { AppStore, AppUser } from '../state/app-store.service';
import { Router } from '@angular/router';

/**
 * AuthService
 * Provides login, signup, logout flows against the backend API using ApiHttpService.
 * Persists the auth token in AppStore (which syncs to localStorage in browser only).
 * Exposes a currentUser signal derived from the AppStore.
 * Designed to be SSR-safe by guarding localStorage access and avoiding direct DOM APIs.
 */
// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiHttpService);
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);

  /** Derived currentUser signal from AppStore */
  private readonly _currentUser = computed(() => this.store.currentUser()());

  // PUBLIC_INTERFACE
  currentUser(): Signal<AppUser | null> {
    /** Returns a readonly reactive signal of the current user. */
    return this._currentUser;
  }

  // PUBLIC_INTERFACE
  async login(email: string, password: string): Promise<void> {
    /**
     * Logs in with email/password via POST /auth/login.
     * Expects backend to return { token: string, user: { id, name, email } } shape.
     * On success persists token and user into AppStore and navigates to /profile.
     */
    this.store.setLoading(true);
    try {
      const res = await this.api.post<{ token: string; user: AppUser }>(
        '/auth/login',
        { email, password }
      ).toPromise();

      if (res && res.token) {
        this.store.setAuthToken(res.token);
        this.store.setCurrentUser(res.user ?? null);
        await this.router.navigate(['/profile']);
      } else {
        throw new Error('Invalid login response');
      }
    } finally {
      this.store.setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async signup(name: string, email: string, password: string): Promise<void> {
    /**
     * Creates an account via POST /auth/signup.
     * Expects backend to return { token: string, user: { id, name, email } } on success.
     * On success persists token and user and navigates to /profile.
     */
    this.store.setLoading(true);
    try {
      const res = await this.api.post<{ token: string; user: AppUser }>(
        '/auth/signup',
        { name, email, password }
      ).toPromise();

      if (res && res.token) {
        this.store.setAuthToken(res.token);
        this.store.setCurrentUser(res.user ?? null);
        await this.router.navigate(['/profile']);
      } else {
        throw new Error('Invalid signup response');
      }
    } finally {
      this.store.setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async logout(): Promise<void> {
    /**
     * Clears auth token and user in AppStore and navigates to /login.
     * If a backend endpoint exists (e.g., POST /auth/logout) it can be called here (non-blocking).
     */
    try {
      // Fire-and-forget optional backend logout; not required.
      try {
        this.api.post('/auth/logout', {}).subscribe({ next: () => {}, error: () => {} });
      } catch { /* ignore */ }
    } finally {
      this.store.setAuthToken(null);
      this.store.setCurrentUser(null);
      await this.router.navigate(['/login']);
    }
  }
}
