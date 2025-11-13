import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { RUNTIME_CONFIG, RuntimeConfig } from './core/config/runtime-config.token';

function extractNgAppEnv(): RuntimeConfig {
  const env = (process as any).env as Record<string, string | undefined>;
  const allowedKeys: (keyof RuntimeConfig)[] = [
    'NG_APP_API_BASE',
    'NG_APP_BACKEND_URL',
    'NG_APP_WS_URL',
    'NG_APP_NODE_ENV',
    'NG_APP_FEATURE_FLAGS',
    'NG_APP_EXPERIMENTS_ENABLED',
    'NG_APP_LOG_LEVEL',
    'NG_APP_HEALTHCHECK_PATH',
  ];
  const cfg: RuntimeConfig = {};
  for (const k of allowedKeys) {
    if (env[k] !== undefined) {
      (cfg as any)[k] = env[k];
    }
  }
  return cfg;
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: RUNTIME_CONFIG, useValue: extractNgAppEnv() },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
