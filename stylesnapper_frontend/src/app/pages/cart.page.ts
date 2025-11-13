import { Component, computed, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AppStore, CartItem } from '../core/state/app-store.service';
import { FeatureFlagsService } from '../core/feature-flags/feature-flags.service';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  template: `
    <section class="card elev-1">
      <h2>Cart</h2>

      <div *ngIf="count() === 0; else listTpl" class="mt-2">
        <p>Your selected items will appear here.</p>
      </div>

      <ng-template #listTpl>
        <ul class="mt-2" style="list-style:none; padding:0; margin:0;">
          <li *ngFor="let item of items()" class="p-2 rounded mt-1" style="border:1px solid rgba(17,24,39,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>{{ item.name }}</strong>
                <div class="mt-1" style="font-size:0.9rem; color:rgba(17,24,39,0.7);">
                  Qty: {{ item.qty }} · Price: {{ item.price | currency:'USD' }}
                </div>
              </div>
              <div>
                <button class="btn btn-outline" (click)="dec(item)" [disabled]="item.qty <= 1">-</button>
                <button class="btn ml-2" (click)="inc(item)">+</button>
              </div>
            </div>
          </li>
        </ul>

        <div class="mt-3">
          <strong>Subtotal: {{ subtotal() | currency:'USD' }}</strong>
        </div>
      </ng-template>

      <div class="mt-3">
        <button class="btn" [disabled]="count() === 0">Checkout</button>
        <button class="btn btn-outline ml-2" (click)="clear()" [disabled]="count() === 0">Clear</button>
      </div>

      <div class="mt-3" *ngIf="flags.isEnabled('free-shipping')">
        <small class="text-success">Free shipping promotion is enabled!</small>
      </div>
    </section>
  `
})
export class CartPage {
  private store = inject(AppStore);
  readonly flags = inject(FeatureFlagsService);

  items = computed(() => this.store.cartItems()());
  count = computed(() => this.store.cartCount()());
  subtotal = computed(() => this.store.cartSubtotal()());

  inc(item: CartItem): void {
    this.store.updateCartItem(item.id, item.qty + 1);
  }

  dec(item: CartItem): void {
    this.store.updateCartItem(item.id, item.qty - 1);
  }

  clear(): void {
    this.store.clearCart();
  }
}
