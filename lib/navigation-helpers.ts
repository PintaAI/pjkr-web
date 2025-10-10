/**
 * Navigation helper utilities for handling browser history with hash preservation
 */

/**
 * Updates the current URL in browser history with a hash before navigating to a new route.
 * This ensures that when users click the browser back button, they return to the correct tab.
 * 
 * @param baseUrl - The base URL to preserve (e.g., '/kelas/2')
 * @param hash - The hash to add to the URL (e.g., 'vocabulary')
 * 
 * @example
 * // Before navigating to a detail page, preserve the current tab state
 * preserveHashInHistory('/kelas/2', 'vocabulary');
 * router.push('/kelas/2/vocab/18');
 * 
 * // When user clicks back, they'll return to /kelas/2#vocabulary
 */
export function preserveHashInHistory(baseUrl: string, hash: string): void {
  if (typeof window === 'undefined') return;
  
  const urlWithHash = hash ? `${baseUrl}#${hash}` : baseUrl;
  window.history.replaceState(null, '', urlWithHash);
}

/**
 * Navigates to a detail page while preserving the parent page's tab state in history.
 * Combines history preservation with navigation in a single function.
 * 
 * @param router - Next.js router instance
 * @param parentUrl - The parent page URL to preserve (e.g., '/kelas/2')
 * @param detailUrl - The detail page URL to navigate to (e.g., '/kelas/2/vocab/18')
 * @param hash - The hash to preserve on the parent page (e.g., 'vocabulary')
 * 
 * @example
 * import { useRouter } from 'next/navigation';
 * import { navigateWithHashPreservation } from '@/lib/navigation-helpers';
 * 
 * const router = useRouter();
 * navigateWithHashPreservation(router, '/kelas/2', '/kelas/2/vocab/18', 'vocabulary');
 */
export function navigateWithHashPreservation(
  router: { push: (url: string) => void },
  parentUrl: string,
  detailUrl: string,
  hash: string
): void {
  preserveHashInHistory(parentUrl, hash);
  router.push(detailUrl);
}

/**
 * Gets the current hash from the URL without the # symbol
 * 
 * @returns The current hash or empty string if no hash exists
 * 
 * @example
 * // URL: /kelas/2#vocabulary
 * const currentHash = getCurrentHash(); // Returns: 'vocabulary'
 */
export function getCurrentHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash.slice(1);
}

/**
 * Checks if the current URL has a specific hash
 * 
 * @param hash - The hash to check for
 * @returns True if the current URL has the specified hash
 * 
 * @example
 * // URL: /kelas/2#vocabulary
 * hasHash('vocabulary'); // Returns: true
 * hasHash('materi'); // Returns: false
 */
export function hasHash(hash: string): boolean {
  return getCurrentHash() === hash;
}