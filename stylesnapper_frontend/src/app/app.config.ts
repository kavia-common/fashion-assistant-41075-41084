import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { RUNTIME_CONFIG, RuntimeConfig } from './core/config/runtime-config.token';
import { RuntimeConfigService } from './core/config/runtime-config.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { FeatureFlagsService } from './core/feature-flags/feature-flags.service';

function initRuntimeConfigFactory(svc: RuntimeConfigService) {
  return () => svc.load();
}

function initFeatureFlagsFactory(flags: FeatureFlagsService) {
  // Initialize flags after runtime config is loaded
  return () => flags.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    // Provide empty default; server will override with real values
    { provide: RUNTIME_CONFIG, useValue: {} as RuntimeConfig },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initRuntimeConfigFactory,
      deps: [RuntimeConfigService],
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initFeatureFlagsFactory,
      deps: [FeatureFlagsService],
    },
  ]
};
