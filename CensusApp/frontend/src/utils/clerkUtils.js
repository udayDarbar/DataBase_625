// src/utils/clerkUtils.js

/**
 * Utility function to clean problematic Clerk URL parameters
 * Prevents errors when redirecting after a Google account connection
 * @returns {boolean} True if parameters were cleaned, false otherwise
 */
export function cleanClerkUrlParams() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for Clerk's modal state parameter
      if (urlParams.has('__clerk_modal_state')) {
        const url = new URL(window.location.href);

        // Removes the __clerk_modal_state parameter from the URL
        url.searchParams.delete('__clerk_modal_state');

        window.history.replaceState({}, document.title, url.toString());
        console.debug('Cleaned Clerk URL parameters');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error cleaning Clerk URL parameters:', e);
      return false;
    }
  }