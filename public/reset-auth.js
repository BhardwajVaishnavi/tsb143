/**
 * Reset authentication state
 * Run this in the browser console to clear authentication data
 */
(function() {
  console.log('Resetting authentication state...');
  localStorage.removeItem('user');
  localStorage.removeItem('localActivities');
  console.log('Authentication state reset. Please refresh the page and log in again.');
  
  // Redirect to login page
  window.location.href = '/auth/login';
})();
