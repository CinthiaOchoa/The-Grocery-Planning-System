async function handleSignup(event) {
    event.preventDefault();
  
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const zip_code = document.querySelector("#zip_code").value.trim();
    const budget_per_week = document.querySelector("#budget_per_week").value.trim();
    const theme_preference = document.querySelector("#theme_preference").value || "light";
    const password = document.querySelector("#password").value;
    const confirm_password = document.querySelector("#confirm_password").value;
  
    if (!name || !email || !password || !confirm_password) {
      alert("Please fill in all required fields.");
      return;
    }
  
    if (password !== confirm_password) {
      alert("Passwords do not match.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          budget_per_week: budget_per_week || null,
          zip_code: zip_code || null,
          profile_picture_url: null,
          theme_preference
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || data.error || "Signup failed");
        return;
      }
  
      localStorage.setItem("currentStudent", JSON.stringify(data));
      localStorage.setItem("themePreference", data.theme_preference || "light");
  
      alert("Account created successfully");
      window.location.href = "./dashboard.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Cannot connect to server");
    }
  }
  
  document
    .getElementById("signupForm")
    .addEventListener("submit", handleSignup);