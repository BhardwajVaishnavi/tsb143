/**
 * Fix admin role in localStorage
 * Run this in the browser console to fix the admin role
 */
(function() {
  console.log('Fixing admin role in localStorage...');
  
  try {
    // Get the current user data
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.error('No user data found in localStorage');
      return;
    }
    
    // Parse the user data
    const user = JSON.parse(userData);
    
    // Check if this is the admin user
    if (user.email === 'admin@example.com') {
      console.log('Found admin user, fixing role...');
      
      // Update the role to ADMIN (uppercase)
      user.role = 'ADMIN';
      
      // Save the updated user data
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Admin role fixed. Please refresh the page.');
    } else {
      console.log('User is not admin, no changes made.');
    }
  } catch (error) {
    console.error('Error fixing admin role:', error);
  }
})();
