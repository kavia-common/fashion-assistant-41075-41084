import { Component } from '@angular/core';
import { AppShellComponent } from './shell/app-shell.component';

/**
 * Root AppComponent
 * Boots the AppShell, keeping the entry minimal to focus on the shell layout.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent],
  template: `<app-shell />`,
})
export class AppComponent {}
