// auth/script.js
function protectPage() {
  const userData = sessionStorage.getItem("user");

  if (!userData) {
    window.location.replace("../index.html");
    return null; 
  }

  try {
    const user = JSON.parse(userData);
    if (!user.userId) {
      window.location.replace("../index.html");
      return null;
    }
    return user; // 👈 This is very important!
  } catch (e) {
    window.location.replace("../index.html");
    return null;
  }
}
