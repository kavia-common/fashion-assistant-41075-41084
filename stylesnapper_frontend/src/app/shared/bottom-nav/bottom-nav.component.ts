import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

export interface BottomNavItem {
  label: string;
  icon?: string; // optional text icon or could be replaced with SVG later
  path: string;
}

/**
 * BottomNavComponent
 * Fixed bottom navigation bar for primary sections, optimized for mobile.
 * Uses RouterLink and RouterLinkActive for active state styling.
 */
// PUBLIC_INTERFACE
@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  template: `
    <nav class="bottom-nav elev-2" aria-label="Primary">
      <div class="container nav-inner">
        <a
          *ngFor="let item of items"
          class="nav-item focus-ring"
          [routerLink]="item.path"
          routerLinkActive="active"
          [attr.aria-label]="item.label"
        >
          <span class="icon" aria-hidden="true">{{ item.icon || '●' }}</span>
          <span class="label">{{ item.label }}</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-surface);
      border-top: 1px solid rgba(17,24,39,0.06);
      z-index: 40;
    }
    .nav-inner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.25rem;
      min-height: 56px;
    }
    .nav-item {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.125rem;
      padding: 0.5rem 0.25rem;
      color: rgba(17,24,39,0.7);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: background-color 160ms ease, color 160ms ease;
    }
    .nav-item:hover {
      background: rgba(17,24,39,0.04);
      color: var(--color-text);
    }
    .nav-item.active {
      color: var(--color-primary);
      font-weight: 700;
      background: rgba(37,99,235,0.06);
    }
    .icon {
      font-size: 1rem;
      line-height: 1;
    }
    .label {
      font-size: 0.75rem;
    }

    @media (min-width: 640px) {
      .nav-inner { max-width: 720px; }
    }
  `]
})
export class BottomNavComponent {
  @Input() items: BottomNavItem[] = [];
}
