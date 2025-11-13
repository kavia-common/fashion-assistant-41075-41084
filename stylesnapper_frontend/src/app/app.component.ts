import { Component, inject } from '@angular/core';
import { RuntimeConfigService } from './core/config/runtime-config.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private cfg = inject(RuntimeConfigService);

  title = 'stylesnapper_frontend is being generated';

  // Example of using runtime config (no hardcoded URLs)
  get apiBase(): string {
    return this.cfg.get('NG_APP_API_BASE') ?? '';
  }
}
