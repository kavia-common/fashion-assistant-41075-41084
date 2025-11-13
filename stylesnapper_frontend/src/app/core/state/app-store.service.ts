import { Injectable, Signal, computed, signal } from '@angular/core';

/**
 * Types for app state slices
 */
export interface AppUser {
  id: string;
  name: string;
  email?: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number; // unit price
}

/**
 * A lightweight application store built on Angular signals.
 * Holds commonly-needed state without external dependencies.
 */
// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class AppStore {
  /** currently authenticated user (if any) */
  private readonly _currentUser = signal<AppUser | null>(null);
  /** current auth token */
  private readonly _authToken = signal<string | null>(null);
  /** cart items with qty/pricing */
  private readonly _cartItems = signal<CartItem[]>([]);
  /** global loading indicator */
  private readonly _isLoading = signal<boolean>(false);
  /** feature flags/experiments record */
  private readonly _featureFlags = signal<Record<string, boolean>>({});

  /** derived total item count in cart */
  private readonly _cartCount = computed(() =>
    this._cartItems().reduce((sum, item) => sum + (item.qty || 0), 0),
  );

  /** derived subtotal in cart */
  private readonly _cartSubtotal = computed(() =>
    this._cartItems().reduce((sum, item) => sum + item.qty * item.price, 0),
  );

  // PUBLIC_INTERFACE
  currentUser(): Signal<AppUser | null> {
    /** Returns a readonly reactive signal of the current user. */
    return this._currentUser.asReadonly();
  }

  // PUBLIC_INTERFACE
  authToken(): Signal<string | null> {
    /** Returns a readonly reactive signal of the auth token. */
    return this._authToken.asReadonly();
  }

  // PUBLIC_INTERFACE
  cartItems(): Signal<CartItem[]> {
    /** Returns a readonly reactive signal of cart items. */
    return this._cartItems.asReadonly();
  }

  // PUBLIC_INTERFACE
  isLoading(): Signal<boolean> {
    /** Returns a readonly reactive signal of loading state. */
    return this._isLoading.asReadonly();
  }

  // PUBLIC_INTERFACE
  featureFlags(): Signal<Record<string, boolean>> {
    /** Returns a readonly reactive signal of feature flags. */
    return this._featureFlags.asReadonly();
  }

  // PUBLIC_INTERFACE
  cartCount(): Signal<number> {
    /** Returns a readonly reactive signal of the cart item count. */
    return this._cartCount;
  }

  // PUBLIC_INTERFACE
  cartSubtotal(): Signal<number> {
    /** Returns a readonly reactive signal of the cart subtotal price. */
    return this._cartSubtotal;
  }

  // Mutators (not marked public interface to keep surface small; can be expanded later)

  setCurrentUser(user: AppUser | null): void {
    this._currentUser.set(user);
  }

  setAuthToken(token: string | null): void {
    this._authToken.set(token);
    // Optional: sync to localStorage in browser only
    try {
      const g = globalThis as any;
      if (g?.localStorage && typeof g.localStorage.setItem === 'function') {
        if (token) g.localStorage.setItem('auth_token', token);
        else g.localStorage.removeItem('auth_token');
      }
    } catch {
      // ignore SSR or restricted environments
    }
  }

  addToCart(item: CartItem): void {
    const items = this._cartItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      const updated = [...items];
      updated[idx] = { ...updated[idx], qty: updated[idx].qty + item.qty };
      this._cartItems.set(updated);
    } else {
      this._cartItems.set([...items, item]);
    }
  }

  updateCartItem(id: string, qty: number): void {
    const items = this._cartItems().map(i => (i.id === id ? { ...i, qty } : i));
    this._cartItems.set(items.filter(i => i.qty > 0));
  }

  clearCart(): void {
    this._cartItems.set([]);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setFeatureFlags(flags: Record<string, boolean>): void {
    this._featureFlags.set(flags || {});
  }

  isFlagEnabled(key: string): boolean {
    const map = this._featureFlags();
    return !!map[key];
  }
}
