import { Injectable, Inject, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { RUNTIME_CONFIG, RuntimeConfig } from './runtime-config.token';

const RUNTIME_CONFIG_STATE_KEY = makeStateKey<RuntimeConfig>('RUNTIME_CONFIG_STATE_KEY');
const RUNTIME_CONFIG_URL = '/assets/runtime-config.json';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private config: RuntimeConfig | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private transferState: TransferState,
    @Inject(RUNTIME_CONFIG) private providedConfig: RuntimeConfig | null
  ) {
    // If provided via DI (e.g., server pre-injection), prefer that
    if (this.providedConfig) {
      this.config = this.providedConfig;
      // Ensure it's also available for the browser through TransferState
      if (isPlatformServer(this.platformId)) {
        this.transferState.set(RUNTIME_CONFIG_STATE_KEY, this.providedConfig);
      }
    } else {
      // If no provided config, try to read TransferState (browser hydration path)
      const tsConfig = this.transferState.get(RUNTIME_CONFIG_STATE_KEY, null as unknown as RuntimeConfig | null);
      if (tsConfig) {
        this.config = tsConfig;
      }
    }
  }

  /**
   * Loads runtime configuration from the server endpoint at app start in the browser,
   * while ensuring SSR safety using TransferState for hydration.
   */
  async load(): Promise<void> {
    // If config already known (from DI or TransferState), skip fetch in browser
    if (this.config) {
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      try {
        // Use globalThis['fetch'] to avoid lint "no-undef" in Node/SSR context
        const fetchFn = (globalThis as any)['fetch'] as undefined | ((input: any, init?: any) => Promise<any>);
        if (!fetchFn) {
          this.config = {};
          return;
        }
        const response = await fetchFn(RUNTIME_CONFIG_URL, { credentials: 'same-origin' as any });
        if (!response || !response.ok) {
          // Non-blocking: proceed with empty config if endpoint not found
          this.config = {};
          return;
        }
        const json = (await response.json()) as RuntimeConfig;
        this.config = json ?? {};
        // Stash in TransferState for any subsequent navigations that might use it
        this.transferState.set(RUNTIME_CONFIG_STATE_KEY, this.config);
      } catch {
        // Fail open with empty config to avoid crashing startup
        this.config = {};
      }
    } else {
      // On server, if not provided, default to empty (server will inject via provider)
      this.config = this.config ?? {};
    }
  }

  // PUBLIC_INTERFACE
  getAll(): RuntimeConfig {
    /** Returns the entire runtime configuration object. */
    return this.config ?? {};
  }

  // PUBLIC_INTERFACE
  get<K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K] {
    /** Returns a specific config value by key, undefined if not present. */
    return (this.config ?? {})[key];
  }

  // PUBLIC_INTERFACE
  require<K extends keyof RuntimeConfig>(key: K, fallback?: RuntimeConfig[K]): RuntimeConfig[K] {
    /**
     * Returns a specific config value; if missing, returns provided fallback or throws.
     */
    const value = this.get(key);
    if (value === undefined || value === null) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Missing required runtime config key: ${String(key)}`);
    }
    return value;
  }
}
