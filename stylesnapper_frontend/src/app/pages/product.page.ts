import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-product-page',
  standalone: true,
  template: `
    <section class="card elev-1">
      <h2>Product</h2>
      <p>Product details for ID: <strong>{{ id }}</strong></p>
      <div class="mt-3">
        <button class="btn btn-secondary">Add to Cart</button>
      </div>
    </section>
  `
})
export class ProductPage {
  id: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
