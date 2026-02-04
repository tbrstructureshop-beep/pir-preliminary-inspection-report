/* ==== SHARED AUTHENTICATION LOGIC ==== */

/**
 * Checks if a user is logged in. 
 * If not, redirects to the login page.
 */
function protectPage() {
    const userData = sessionStorage.getItem("user");

    if (!userData) {
        // Redirect to the root login page
        // Note: Using a "/" at the start usually points to the root directory
        window.location.replace("/index.html");
        return null;
    }

    try {
        const user = JSON.parse(userData);
        if (!user.userId) {
            window.location.replace("/index.html");
            return null;
        }
        return user; // Returns the user object if they are valid
    } catch (e) {
        window.location.replace("/index.html");
        return null;
    }
}

/**
 * Clears session and logs out
 */
function logout() {
    sessionStorage.clear();
    window.location.replace("/index.html");
}

/**
 * Helper to get user info easily
 */
function getCurrentUser() {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
}
