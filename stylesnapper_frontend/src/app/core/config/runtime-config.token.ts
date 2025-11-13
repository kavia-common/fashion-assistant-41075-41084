import { InjectionToken } from '@angular/core';

// PUBLIC_INTERFACE
export interface RuntimeConfig {
  /** Base URL for API calls from the frontend */
  NG_APP_API_BASE?: string;
  /** Backend service URL (if different from API base) */
  NG_APP_BACKEND_URL?: string;
  /** WebSocket URL for realtime features */
  NG_APP_WS_URL?: string;
  /** Node environment indicator (development/production/test) */
  NG_APP_NODE_ENV?: string;
  /** Comma-separated or JSON-stringified feature flags */
  NG_APP_FEATURE_FLAGS?: string;
  /** Whether experiments are enabled (string "true"/"false" or similar) */
  NG_APP_EXPERIMENTS_ENABLED?: string;
  /** Logging verbosity (e.g., debug, info, warn, error) */
  NG_APP_LOG_LEVEL?: string;
  /** Healthcheck endpoint path to use from the frontend */
  NG_APP_HEALTHCHECK_PATH?: string;
}

/**
 * PUBLIC_INTERFACE
 * Injection token for providing the resolved runtime configuration at startup.
 */
export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');
