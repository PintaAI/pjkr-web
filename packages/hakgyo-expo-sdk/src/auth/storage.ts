import * as SecureStore from 'expo-secure-store';

export class AuthStorage {
  private prefix: string;

  constructor(prefix: string = 'hakgyo_auth') {
    this.prefix = prefix;
  }

  async setItem(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(`${this.prefix}_${key}`, value);
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(`${this.prefix}_${key}`);
    } catch {
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(`${this.prefix}_${key}`);
  }

  async clear(): Promise<void> {
    // SecureStore doesn't have a way to list all keys, so we need to clear known keys
    // For now, clear the session key which is the primary one we use
    await this.removeItem('session');
  }
}
