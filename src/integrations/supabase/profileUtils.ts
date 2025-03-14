
// This file now serves as a centralized export point for profile-related functions
import { getUserProfileByEmail, createUserProfile } from './userProfileOperations';
import { createUserCabinet } from './cabinetOperations';
import { handleSignupError } from './authErrorHandlers';

// Re-export all functions
export {
  getUserProfileByEmail,
  createUserProfile,
  createUserCabinet,
  handleSignupError
};
