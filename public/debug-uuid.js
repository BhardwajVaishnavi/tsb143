/**
 * Debug script to search for a UUID in localStorage and sessionStorage
 * Run this in the browser console to find references to a specific UUID
 */
(function() {
  const uuid = prompt('Enter UUID to search for:');
  if (!uuid) {
    console.log('No UUID provided');
    return;
  }

  console.log(`Searching for UUID: ${uuid}`);
  
  // Check localStorage
  console.log('Checking localStorage...');
  const localStorageMatches = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.includes(uuid)) {
          try {
            localStorageMatches[key] = JSON.parse(value);
          } catch {
            localStorageMatches[key] = value;
          }
        }
      } catch (e) {
        console.error(`Error processing localStorage item ${key}:`, e);
      }
    }
  }
  
  // Check sessionStorage
  console.log('Checking sessionStorage...');
  const sessionStorageMatches = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      try {
        const value = sessionStorage.getItem(key);
        if (value && value.includes(uuid)) {
          try {
            sessionStorageMatches[key] = JSON.parse(value);
          } catch {
            sessionStorageMatches[key] = value;
          }
        }
      } catch (e) {
        console.error(`Error processing sessionStorage item ${key}:`, e);
      }
    }
  }
  
  // Check cookies
  console.log('Checking cookies...');
  const cookieMatches = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (value && value.includes(uuid)) {
      cookieMatches[name] = value;
    }
  });
  
  // Output results
  console.log('Results:');
  console.log('localStorage matches:', Object.keys(localStorageMatches).length > 0 ? localStorageMatches : 'None');
  console.log('sessionStorage matches:', Object.keys(sessionStorageMatches).length > 0 ? sessionStorageMatches : 'None');
  console.log('cookie matches:', Object.keys(cookieMatches).length > 0 ? cookieMatches : 'None');
})();
