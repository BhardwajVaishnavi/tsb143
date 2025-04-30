/**
 * Helper functions for authentication in Vercel deployment
 */

// Check if we're in a Vercel deployment
export const isVercelDeployment = (): boolean => {
  return window.location.hostname.includes('vercel.app');
};

// Special login handler for Vercel deployment
export const handleVercelLogin = (email: string, password: string): Promise<any> => {
  console.log('Using Vercel deployment login handler');
  
  // Check if credentials match the admin user
  if (email === 'admin@example.com' && password === 'admin123') {
    // Create a mock user object
    const user = {
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
    
    // Store the user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Return a promise that resolves with the user
    return Promise.resolve({
      user,
      token: user.token
    });
  }
  
  // Return a promise that rejects with an error
  return Promise.reject(new Error('Invalid email or password'));
};

// Special me handler for Vercel deployment
export const handleVercelMe = (): Promise<any> => {
  console.log('Using Vercel deployment me handler');
  
  // Get the user from localStorage
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    return Promise.reject(new Error('No user found'));
  }
  
  try {
    const user = JSON.parse(userJson);
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Special logout handler for Vercel deployment
export const handleVercelLogout = (): Promise<void> => {
  console.log('Using Vercel deployment logout handler');
  
  // Remove the user from localStorage
  localStorage.removeItem('user');
  
  // Return a promise that resolves
  return Promise.resolve();
};
