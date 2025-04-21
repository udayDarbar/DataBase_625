import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Set a default API URL if the environment variable is not set
const DEFAULT_API_URL = 'http://localhost:5001';

/**
 * Custom hook for syncing the current user's session data to the backend.
 *
 * This hook retrieves the user's profile data from Clerk, then sends it to your
 * API endpoint to be saved in your database.
 *
 * @returns {Object} Object containing isLoaded, user, and isSynced states
 */
export function UserSession() {
  const { isLoaded, user } = useUser();
  const [isSynced, setIsSynced] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL || DEFAULT_API_URL;

  useEffect(() => {
    // Only attempt syncing if user data is loaded and available,
    // and we haven't synced already.
    if (isLoaded && user && !isSynced) {
      // First, fetch the existing user profile to get the role
      axios.get(`${API_BASE}/api/user-profile`, {
        params: { userId: user.id }
      })
      .then(roleResponse => {
        // Get the current role from the database
        const currentRole = roleResponse.data && roleResponse.data.role 
          ? roleResponse.data.role 
          : 'User'; // Default if not found

        // User application data with role
        const userData = {
          userId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          role: currentRole // Include the current role
        };

        // Sync user data to your backend
        return axios.post(`${API_BASE}/api/save-user`, userData);
      })
      .then((response) => {
        console.log('User session synced successfully');
        setIsSynced(true); // Mark sync as complete
      })
      .catch((error) => {
        console.error(
          'Error syncing user session:',
          error
        );
      });
    }
  }, [isLoaded, user, isSynced, API_BASE]);

  return { isLoaded, user, isSynced };
}