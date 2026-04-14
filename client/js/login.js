import { authAPI } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // 🚨 THIS STOPS THE URL ?email=...

    const email = document.getElementById("studentEmail").value.trim();
    const password = document.getElementById("studentPassword").value.trim();

    try {
      const student = await authAPI.login({ email, password });

      // save user
      localStorage.setItem("currentStudent", JSON.stringify(student));
      localStorage.setItem("studentId", student.student_id);

      // go to profile
      window.location.href = "profile.html";

    } catch (error) {
      alert(error.message || "Login failed");
    }
  });
});