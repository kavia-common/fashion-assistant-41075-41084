import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopAppBarComponent } from '../shared/top-app-bar/top-app-bar.component';
import { BottomNavComponent, BottomNavItem } from '../shared/bottom-nav/bottom-nav.component';

/**
 * AppShellComponent
 * Root shell layout that composes the TopAppBar, main content via RouterOutlet,
 * and a BottomNav for primary navigation. Mobile-first and Ocean Professional styled.
 */
// PUBLIC_INTERFACE
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, TopAppBarComponent, BottomNavComponent],
  template: `
    <div class="app-shell">
      <app-top-app-bar [title]="title"></app-top-app-bar>

      <main class="content container">
        <router-outlet />
      </main>

      <app-bottom-nav [items]="navItems"></app-bottom-nav>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100dvh;
      display: grid;
      grid-template-rows: auto 1fr auto;
      background: var(--color-bg);
    }

    .content {
      width: 100%;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }
  `]
})
export class AppShellComponent {
  title = 'StyleSnapper';

  navItems: BottomNavItem[] = [
    { label: 'Home', icon: '🏠', path: '' },
    { label: 'Upload', icon: '⬆️', path: 'upload' },
    { label: 'Discover', icon: '✨', path: 'discover' },
    { label: 'Profile', icon: '👤', path: 'profile' },
  ];
}
