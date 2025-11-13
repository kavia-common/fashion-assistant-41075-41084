import { Component } from '@angular/core';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-search-page',
  standalone: true,
  template: `
    <section class="card elev-1">
      <h2>Search</h2>
      <p>Find outfits, items, and styles.</p>
      <div class="mt-3 form-row">
        <div class="form-col">
          <input type="text" placeholder="Search products, brands, styles..." />
        </div>
        <button class="btn">Search</button>
      </div>
    </section>
  `
})
export class SearchPage {}
