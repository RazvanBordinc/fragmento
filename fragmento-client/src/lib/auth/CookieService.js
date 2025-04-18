/**
 * Cookie Service - Handles setting and retrieving cookies for authentication
 *
 * @format
 */

// Helper function to set a cookie with expiry
export const setCookie = (name, value, expiryDays = 7) => {
  if (!value) return;

  try {
    const date = new Date();
    date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();

    // For JWT tokens, ensure we're properly handling them
    let encodedValue =
      typeof value === "string"
        ? encodeURIComponent(value)
        : encodeURIComponent(String(value));

    // Set cookie
    document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error(`Error setting cookie '${name}':`, error);
  }
};

// Helper function to get a cookie by name
export const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const encodedValue = c.substring(nameEQ.length, c.length);
        return decodeURIComponent(encodedValue);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Enhanced helper function to delete a cookie - covers all bases
export const deleteCookie = (name) => {
  // Try various combinations of path and domain to ensure cookie is deleted
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `${name}=; Path=/; Domain=${window.location.hostname}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

  // Also try without encoding
  document.cookie = `${name}=; Max-Age=-99999999;`;
};

/**
 * Handle both camelCase and PascalCase property names from the API
 */
const getProperty = (obj, camelCaseProp) => {
  if (!obj) return undefined;

  // Try camelCase first (e.g. "token")
  if (obj[camelCaseProp] !== undefined) {
    return obj[camelCaseProp];
  }

  // Try PascalCase (e.g. "Token")
  const pascalCaseProp =
    camelCaseProp.charAt(0).toUpperCase() + camelCaseProp.slice(1);
  return obj[pascalCaseProp];
};

// Store auth data in both localStorage and cookies
export const storeAuthData = (authData) => {
  if (!authData) return;

  // Get properties using our helper function that checks both camelCase and PascalCase
  const token = getProperty(authData, "token");
  const refreshToken = getProperty(authData, "refreshToken");
  const tokenExpiration = getProperty(authData, "tokenExpiration");
  const id = getProperty(authData, "id");
  const username = getProperty(authData, "username");
  const email = getProperty(authData, "email");

  if (!token) return;

  // Set in localStorage
  localStorage.setItem("token", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (tokenExpiration) localStorage.setItem("tokenExpiration", tokenExpiration);
  if (id) localStorage.setItem("userId", id);
  if (username) localStorage.setItem("username", username);
  if (email) localStorage.setItem("email", email);

  try {
    // Store the token in cookie for middleware
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const expires = "; expires=" + date.toUTCString();

    // Set the token cookie
    document.cookie = `token=${token}${expires}; path=/; SameSite=Lax`;

    // Set other cookies
    if (id) setCookie("userId", id);
    if (username) setCookie("username", username);
  } catch (error) {
    console.error("Error setting auth cookies:", error);
  }
};

// Clear auth data from both localStorage and cookies - enhanced version
export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("email");

  // Clear cookies with enhanced approach
  deleteCookie("token");
  deleteCookie("userId");
  deleteCookie("username");

  // Also check for any unexpected cookie casing
  deleteCookie("Token");
  deleteCookie("UserId");
  deleteCookie("Username");
};
