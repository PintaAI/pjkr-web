import { HakgyoSDKConfig } from './index';

export function validateConfig(config: HakgyoSDKConfig): void {
  if (!config.baseURL) {
    throw new Error('HakgyoSDK Configuration Error: baseURL is required');
  }

  try {
    new URL(config.baseURL);
  } catch (e) {
    throw new Error('HakgyoSDK Configuration Error: baseURL must be a valid URL');
  }
}
