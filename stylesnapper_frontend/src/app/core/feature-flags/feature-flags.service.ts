import { Injectable } from '@angular/core';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { AppStore } from '../state/app-store.service';

/**
 * FeatureFlagsService
 * Reads NG_APP_FEATURE_FLAGS and NG_APP_EXPERIMENTS_ENABLED from the runtime configuration
 * and exposes helpers to check if a flag is enabled. It also hydrates the AppStore feature flag map.
 */
// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private flags: Record<string, boolean> = {};

  constructor(
    private runtime: RuntimeConfigService,
    private store: AppStore,
  ) {}

  /**
   * Initialize flags from runtime config. Call during app initialization.
   * Accepts:
   * - NG_APP_FEATURE_FLAGS: can be JSON string ({"flagA":true}) or comma-separated list (flagA,flagB)
   * - NG_APP_EXPERIMENTS_ENABLED: "true"/"1"/"yes" -> enables a generic "experiments" flag.
   */
  async init(): Promise<void> {
    const rawFlags = this.runtime.get('NG_APP_FEATURE_FLAGS');
    const experimentsRaw = this.runtime.get('NG_APP_EXPERIMENTS_ENABLED');

    const parsed: Record<string, boolean> = {};

    // Parse feature flags
    if (typeof rawFlags === 'string' && rawFlags.trim().length > 0) {
      const str = rawFlags.trim();
      try {
        // Try JSON map first
        const json = JSON.parse(str);
        if (json && typeof json === 'object') {
          for (const [k, v] of Object.entries(json)) {
            parsed[k] = !!v;
          }
        }
      } catch {
        // Fallback: comma-separated list
        const parts = str.split(',').map(s => s.trim()).filter(Boolean);
        for (const key of parts) {
          parsed[key] = true;
        }
      }
    }

    // Experiments flag
    const experimentsEnabled = typeof experimentsRaw === 'string'
      ? /^(true|1|yes|on)$/i.test(experimentsRaw.trim())
      : false;

    if (experimentsEnabled) {
      parsed['experiments'] = true;
    }

    this.flags = parsed;
    this.store.setFeatureFlags(parsed);
  }

  // PUBLIC_INTERFACE
  isEnabled(flagKey: string): boolean {
    /** Returns true if the given feature flag is enabled. */
    return !!this.flags[flagKey];
  }

  // PUBLIC_INTERFACE
  getAll(): Record<string, boolean> {
    /** Returns an immutable copy of all flags. */
    return { ...this.flags };
  }
}
