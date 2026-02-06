import { Logger, LogLevel, logger } from '../utils/logger';
import { apiClient } from '../api/client';
import { initAuthClient } from '../auth/client';

export interface HakgyoSDKConfig {
  // Required
  baseURL: string;

  // Optional - Auth Configuration
  auth?: {
    storagePrefix?: string;
    sessionRefreshThreshold?: number; // Minutes
    autoRefresh?: boolean;
    deepLinkScheme?: string;
  };

  // Optional - API Configuration
  api?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  };

  // Optional - Logging
  logging?: {
    enabled?: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
  };

  // Optional - Platform-specific
  platform?: {
    deviceId?: string;
    platformType?: 'ios' | 'android' | 'web';
  };
}

export const DEFAULT_CONFIG: Partial<HakgyoSDKConfig> = {
  auth: {
    storagePrefix: 'hakgyo_auth',
    sessionRefreshThreshold: 5,
    autoRefresh: true,
    deepLinkScheme: 'hakgyo://',
  },
  api: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  logging: {
    enabled: false,
    level: 'error',
  },
};

let sdkConfig: HakgyoSDKConfig | null = null;

export function initSDK(config: HakgyoSDKConfig): HakgyoSDKConfig {
  sdkConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    auth: { ...DEFAULT_CONFIG.auth, ...config.auth },
    api: { ...DEFAULT_CONFIG.api, ...config.api },
    logging: { ...DEFAULT_CONFIG.logging, ...config.logging },
  };

  // Initialize Logger
  if (sdkConfig.logging?.enabled) {
    let level = LogLevel.ERROR;
    switch (sdkConfig.logging.level) {
      case 'debug': level = LogLevel.DEBUG; break;
      case 'info': level = LogLevel.INFO; break;
      case 'warn': level = LogLevel.WARN; break;
      case 'error': level = LogLevel.ERROR; break;
    }
    logger.setLevel(level);
  } else {
    logger.setLevel(LogLevel.NONE);
  }

  // Update API Client
  apiClient.setConfig(sdkConfig);
  
  // Initialize Auth Client
  initAuthClient(sdkConfig);

  return sdkConfig;
}

export function getConfig(): HakgyoSDKConfig {
  if (!sdkConfig) {
    throw new Error('SDK not initialized. Call initSDK() first.');
  }
  return sdkConfig;
}
