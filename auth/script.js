// auth/script.js

function protectPage() {
  // 1. Get the string from sessionStorage
  const userData = sessionStorage.getItem("user");

  // 2. If nothing is found, go back to login
  if (!userData) {
    window.location.replace("../index.html");
    return null;
  }

  try {
    // 3. Convert the string back into an object
    const user = JSON.parse(userData);

    // 4. Double check that the userId actually exists inside that object
    if (!user || !user.userId) {
      window.location.replace("../index.html");
      return null;
    }

    // 5. Return the user object so other scripts can use it
    return user;
  } catch (e) {
    console.error("Auth error:", e);
    window.location.replace("../index.html");
    return null;
  }
}

/**
 * Shared logout function
 */
function logout() {
  sessionStorage.clear();
  window.location.replace("../index.html");
}
