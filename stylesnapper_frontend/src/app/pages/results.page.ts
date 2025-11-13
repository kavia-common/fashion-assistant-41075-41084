import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

// PUBLIC_INTERFACE
@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [NgIf, RouterLink],
  template: `
    <section class="card elev-1">
      <h2>Results</h2>
      <p>Viewing AI analysis for: <strong>{{ id }}</strong></p>
      <a class="btn btn-outline mt-3" [routerLink]="['/discover']">Explore more</a>
    </section>
  `
})
export class ResultsPage {
  id: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
