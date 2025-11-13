import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AppStore } from '../core/state/app-store.service';
import { FeatureFlagsService } from '../core/feature-flags/feature-flags.service';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <section class="card elev-1">
      <div class="mt-1" *ngIf="isExperimentsEnabled()">
        <span class="badge bg-primary rounded p-2">Experimental</span>
      </div>
      <h2>Product</h2>
      <p>Product details for ID: <strong>{{ id }}</strong></p>
      <div class="mt-3">
        <button class="btn btn-secondary" (click)="add()">Add to Cart</button>
      </div>
      <div class="mt-3" *ngIf="cartCount() > 0">
        <small>Cart items: <strong>{{ cartCount() }}</strong> · Subtotal: <strong>{{ cartSubtotal() | currency:'USD' }}</strong></small>
      </div>
    </section>
  `
})
export class ProductPage {
  private route = inject(ActivatedRoute);
  private store = inject(AppStore);
  private flags = inject(FeatureFlagsService);

  id: string | null = this.route.snapshot.paramMap.get('id');

  cartCount = computed(() => this.store.cartCount()());
  cartSubtotal = computed(() => this.store.cartSubtotal()());

  add(): void {
    const id = this.id || 'unknown';
    this.store.addToCart({
      id,
      name: `Product ${id}`,
      qty: 1,
      price: 29.0,
    });
  }

  isExperimentsEnabled(): boolean {
    return this.flags.isEnabled('experiments');
  }
}
