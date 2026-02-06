import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { HakgyoSDKConfig } from '../config';
import { SignInResponse, SignUpResponse, SignOutResponse } from '../types/auth';
import { AuthError } from '../errors/AuthError';
import { logger } from '../utils/logger';

let _authClient: any = null; // using any to avoid complex return type inference issues in SDK

export function initAuthClient(config: HakgyoSDKConfig) {
  _authClient = createAuthClient({
    baseURL: config.baseURL,
    fetchOptions: {
      headers: {
        'Origin': config.baseURL
      },
      // Add timeout to auth requests using AbortSignal.timeout()
      signal: config.api?.timeout ? AbortSignal.timeout(config.api.timeout) : undefined,
    },
    plugins: [
      expoClient({
        scheme: config.auth?.deepLinkScheme?.replace('://', '') || 'hakgyo',
        storage: SecureStore,
        storagePrefix: config.auth?.storagePrefix || 'hakgyo_auth',
      })
    ]
  });
}

export function getAuthClient() {
  if (!_authClient) {
    throw new Error("Auth client not initialized. Call initSDK first.");
  }
  return _authClient;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<SignInResponse> {
  try {
    const client = getAuthClient();
    const res = await client.signIn.email({
      email,
      password,
    });

    if (res.error) {
      return {
        success: false,
        error: res.error.message || 'Sign in failed',
      };
    }

    const data = res.data as any;
    logger.debug('Better Auth SignIn Result:', JSON.stringify(data, null, 2));

    let sessionData = data?.session;
    const user = data?.user;

    // Fallback if data is flattened or session missing but token exists
    if (!sessionData && data?.token) {
         sessionData = {
             token: data.token,
             user: user,
             expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
             createdAt: new Date().toISOString(),
         };
    }

    return {
      success: true,
      session: sessionData && user ? { ...sessionData, user } : undefined,
    };
  } catch (error) {
     if (error instanceof Error) {
        throw new AuthError(error.message, 'SIGN_IN_FAILED', error);
    }
    throw new AuthError('Sign in failed', 'SIGN_IN_FAILED', error);
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<SignUpResponse> {
  try {
    const client = getAuthClient();
    const res = await client.signUp.email({
      email,
      password,
      name,
    });

    if (res.error) {
      return {
        success: false,
        error: res.error.message || 'Sign up failed',
      };
    }

    const data = res.data as any;
    logger.debug('Better Auth SignUp Result:', JSON.stringify(data, null, 2));

    let sessionData = data?.session;
    const user = data?.user;

    if (!sessionData && data?.token) {
         sessionData = {
             token: data.token,
             user: user,
             expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
             createdAt: new Date().toISOString(),
         };
    }

    return {
      success: true,
      session: sessionData && user ? { ...sessionData, user } : undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
        throw new AuthError(error.message, 'SIGN_UP_FAILED', error);
    }
    throw new AuthError('Sign up failed', 'SIGN_UP_FAILED', error);
  }
}

export async function signInWithGoogle(idToken: string): Promise<SignInResponse> {
   try {
    const client = getAuthClient();
    const res = await client.signIn.social({
        provider: 'google',
        idToken: idToken, 
    });

    if (res.error) {
        return {
            success: false,
            error: res.error.message || 'Google sign in failed',
        };
    }

    const data = res.data as any;
    logger.debug('Better Auth Google SignIn Result:', JSON.stringify(data, null, 2));

    let sessionData = data?.session;
    const user = data?.user;

    if (!sessionData && data?.token) {
         sessionData = {
             token: data.token,
             user: user,
             expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
             createdAt: new Date().toISOString(),
         };
    }

    return {
        success: true,
        session: sessionData && user ? { ...sessionData, user } : undefined,
    };

   } catch (error) {
       if (error instanceof Error) {
            throw new AuthError(error.message, 'GOOGLE_SIGN_IN_FAILED', error);
       }
       throw new AuthError('Google sign in failed', 'GOOGLE_SIGN_IN_FAILED', error);
   }
}

export async function signOut(): Promise<SignOutResponse> {
  try {
    const client = getAuthClient();
    await client.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Sign out failed' };
  }
}
