async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector("#studentEmail").value.trim();
  const password = document.querySelector("#studentPassword").value;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("currentStudent", JSON.stringify(data));
    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Cannot connect to server");
  }
}

document
  .getElementById("loginForm")
  .addEventListener("submit", handleLogin);