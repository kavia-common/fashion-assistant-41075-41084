import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FeatureFlagsService } from '../core/feature-flags/feature-flags.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NgIf],
  template: `
    <section class="card elev-1">
      <h2>Welcome to StyleSnapper</h2>
      <p>Your AI-powered fashion assistant.</p>

      <div class="mt-3" *ngIf="flags.isEnabled('experiments')">
        <small class="text-success">Experiments are enabled — you may see early features.</small>
      </div>
    </section>
  `
})
export class HomePage {
  readonly flags = inject(FeatureFlagsService);
}
