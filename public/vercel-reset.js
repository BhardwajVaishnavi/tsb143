/**
 * Reset authentication state for Vercel deployment
 * Run this in the browser console to clear authentication data
 */
(function() {
  console.log('Resetting authentication state for Vercel deployment...');
  
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('localActivities');
  
  // Create a new admin user with the correct role
  const adminUser = {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'ADMIN',
    status: 'active',
    permissions: [{ module: '*', action: '*', resource: '*' }],
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    token: `mock-token-${Date.now()}`
  };
  
  // Store the admin user in localStorage
  localStorage.setItem('user', JSON.stringify(adminUser));
  
  console.log('Authentication state reset for Vercel deployment.');
  console.log('Created new admin user with ADMIN role.');
  console.log('Please refresh the page to apply changes.');
  
  // Ask if the user wants to refresh the page
  if (confirm('Do you want to refresh the page now?')) {
    window.location.reload();
  }
})();
