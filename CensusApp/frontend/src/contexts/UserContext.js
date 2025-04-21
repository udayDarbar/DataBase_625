import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

// Create context
const UserContext = createContext();

/**
 * UserProvider component that centralizes user data management
 * Fetches user profile data once and provides it to all components
 */
export function UserProvider({ children }) {
  const { isLoaded: clerkLoaded, user } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

  // Fetch and sync user data once when the app loads
  useEffect(() => {
    // Only run this effect once when clerk user data is available
    if (!clerkLoaded || !user || initialized) return;

    const initializeUserData = async () => {
      setIsLoading(true);
      try {
        // First fetch the existing profile including role
        let currentRole = 'User'; // Default role
        try {
          const profileResponse = await axios.get(`${REACT_APP_API_URL}/api/user-profile`, {
            params: { userId: user.id }
          });
          
          if (profileResponse.data && profileResponse.data.role) {
            currentRole = profileResponse.data.role;
            // Update local state with fetched profile
            setUserProfile({
              ...profileResponse.data,
              userId: user.id
            });
          }
        } catch (profileError) {
          console.warn('Could not fetch existing user profile:', profileError);
          // Continue with sync even if profile fetch fails
        }

        // Then sync user data to backend
        const userData = {
          userId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          role: currentRole
        };

        // Save user data to backend
        await axios.post(`${REACT_APP_API_URL}/api/save-user`, userData);

        // Set complete user profile in context state
        setUserProfile({
          userId: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          role: currentRole
        });
        
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing user data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserData();
  }, [clerkLoaded, user, initialized, REACT_APP_API_URL]);

  /**
   * Update user profile data
   * @param {Object} updatedData - New user data to save
   * @returns {Promise} Result of the update operation
   */
  const updateUserProfile = async (updatedData) => {
    try {
      setIsLoading(true);
      
      // Merge with existing data
      const dataToSave = {
        ...userProfile,
        ...updatedData,
        userId: user.id
      };
      
      // Save to backend
      await axios.post(`${REACT_APP_API_URL}/api/save-user`, dataToSave);
      
      // Update local state
      setUserProfile(dataToSave);
      
      return { success: true };
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // The context value that will be provided
  const contextValue = {
    userProfile,
    isLoading,
    error,
    updateUserProfile
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook to use the user context
 * @returns {Object} User context value
 */
export function useUserProfile() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProvider');
  }
  return context;
}