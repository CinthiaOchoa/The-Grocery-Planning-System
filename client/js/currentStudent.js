export function loadCurrentStudentUI() {
  const student = JSON.parse(localStorage.getItem("currentStudent"));
  if (!student) return;

  const nameEl = document.querySelector("#topbar-name, .profile-pill strong");
  const avatarEl = document.querySelector("#topbar-avatar, .avatar-small");

  if (nameEl) {
    nameEl.textContent = student.name || "Student User";
  }

  if (avatarEl) {
    const initials = student.name
      ? student.name.split(" ").map(n => n[0]).join("").toUpperCase()
      : "SU";

    avatarEl.textContent = initials;
  }
}

export function requireAuth() {
  const student = localStorage.getItem("currentStudent");

  if (!student) {
    window.location.href = "login.html";
  }
}