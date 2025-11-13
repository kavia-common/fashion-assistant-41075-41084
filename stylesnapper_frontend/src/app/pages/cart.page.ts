import { Component } from '@angular/core';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-cart-page',
  standalone: true,
  template: `
    <section class="card elev-1">
      <h2>Cart</h2>
      <p>Your selected items will appear here.</p>
      <div class="mt-3">
        <button class="btn" disabled>Checkout</button>
      </div>
    </section>
  `
})
export class CartPage {}
