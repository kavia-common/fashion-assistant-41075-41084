import { Component, Input } from '@angular/core';

/**
 * LoadingSpinnerComponent
 * A lightweight, reusable spinner for indicating loading states across the app.
 * Styled to fit the Ocean Professional theme. Mobile-friendly by default.
 */
// PUBLIC_INTERFACE
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrapper" [attr.aria-label]="ariaLabel" role="status">
      <div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>
      <div class="sr-only">{{ ariaLabel }}</div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-text);
    }
    .spinner {
      border: 3px solid rgba(37, 99, 235, 0.15); /* primary soft */
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      box-shadow: 0 1px 2px rgba(var(--shadow-color), 0.08);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    /* Screen reader only text */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  /** Size in px */
  @Input() size = 20;
  /** ARIA label for accessibility */
  @Input() ariaLabel = 'Loading';
}
