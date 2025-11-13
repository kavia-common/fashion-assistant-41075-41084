import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * TopAppBarComponent
 * Responsive top application bar with title and optional action buttons.
 * Mobile-first, subtle elevation and gradient per Ocean Professional theme.
 */
// PUBLIC_INTERFACE
@Component({
  selector: 'app-top-app-bar',
  standalone: true,
  imports: [NgIf],
  template: `
    <header class="top-app-bar elev-1 gradient-surface">
      <div class="container bar-inner">
        <button *ngIf="showBack" class="icon-btn focus-ring" (click)="back.emit()" aria-label="Go back">
          ←
        </button>
        <h1 class="title">{{ title }}</h1>
        <div class="actions">
          <button *ngIf="primaryActionLabel" class="btn btn-outline focus-ring" (click)="primaryAction.emit()">
            {{ primaryActionLabel }}
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-app-bar {
      position: sticky;
      top: 0;
      width: 100%;
      background: var(--color-surface);
      z-index: 50;
      border-bottom: 1px solid rgba(17,24,39,0.06);
      backdrop-filter: saturate(120%) blur(6px);
    }
    .bar-inner {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      min-height: 56px;
      gap: 0.5rem;
    }
    .title {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-text);
      text-align: center;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .icon-btn {
      background: transparent;
      border: 1px solid rgba(17,24,39,0.12);
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text);
      transition: background-color 150ms ease, border-color 150ms ease;
    }
    .icon-btn:hover {
      background: rgba(17,24,39,0.04);
      border-color: rgba(17,24,39,0.18);
    }

    @media (min-width: 640px) {
      .title { text-align: left; }
    }
  `]
})
export class TopAppBarComponent {
  @Input() title = 'StyleSnapper';
  @Input() showBack = false;
  @Input() primaryActionLabel?: string;

  @Output() back = new EventEmitter<void>();
  @Output() primaryAction = new EventEmitter<void>();
}
