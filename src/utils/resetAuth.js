/**
 * Utility function to reset the authentication state
 * This can be used to clear any cached user data that might be causing issues
 */

export const resetAuth = () => {
  console.log('Resetting authentication state...');
  localStorage.removeItem('user');
  localStorage.removeItem('localActivities');
  console.log('Authentication state reset. Please refresh the page and log in again.');
  
  // Redirect to login page
  window.location.href = '/auth/login';
};
