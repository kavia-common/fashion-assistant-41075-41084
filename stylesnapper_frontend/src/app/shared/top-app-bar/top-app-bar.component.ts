import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FeatureFlagsService } from '../../core/feature-flags/feature-flags.service';
import { AuthService } from '../../core/auth/auth.service';

/**
 * TopAppBarComponent
 * Responsive top application bar with title and optional action buttons.
 * Mobile-first, subtle elevation and gradient per Ocean Professional theme.
 */
// PUBLIC_INTERFACE
@Component({
  selector: 'app-top-app-bar',
  standalone: true,
  imports: [NgIf, RouterLink],
  template: `
    <header class="top-app-bar elev-1 gradient-surface">
      <div class="container bar-inner">
        <button *ngIf="showBack" class="icon-btn focus-ring" (click)="back.emit()" aria-label="Go back">
          ←
        </button>
        <h1 class="title">
          <a [routerLink]="['/']" class="title-link">{{ title }}</a>
          <small *ngIf="flags.isEnabled('beta')" class="badge p-2 rounded ml-2" style="color:#1d4ed8; border:1px solid rgba(37,99,235,0.4);">Beta</small>
        </h1>
        <div class="actions">
          <ng-container *ngIf="isAuthed(); else guestActions">
            <a class="btn btn-outline focus-ring" [routerLink]="['/profile']">Profile</a>
          </ng-container>
          <ng-template #guestActions>
            <a class="btn btn-outline focus-ring" [routerLink]="['/login']">Login</a>
            <a class="btn focus-ring" [routerLink]="['/signup']">Sign up</a>
          </ng-template>
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }
    .title-link { color: inherit; text-decoration: none; }
    .title-link:hover { opacity: 0.9; }
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
      .title { text-align: left; justify-content: flex-start; }
    }
  `]
})
export class TopAppBarComponent {
  protected flags = inject(FeatureFlagsService);
  private auth = inject(AuthService);

  @Input() title = 'StyleSnapper';
  @Input() showBack = false;
  @Input() primaryActionLabel?: string;

  @Output() back = new EventEmitter<void>();
  @Output() primaryAction = new EventEmitter<void>();

  isAuthed = computed(() => !!this.auth.currentUser()());
}
