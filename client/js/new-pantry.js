import { pantryAPI } from "./api.js";
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";

document.addEventListener("DOMContentLoaded", initNewPantryPage);

function initNewPantryPage() {
  requireAuth();
  loadCurrentStudentUI();

  const pantryForm = document.getElementById("pantryForm");

  if (!pantryForm) return;

  pantryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const pantry_id = document.getElementById("pantry_id").value.trim();
    const type = document.getElementById("type").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!pantry_id || !type || !location) {
      alert("Please fill in Pantry ID, Type, and Location.");
      return;
    }

    try {
      await pantryAPI.create({
        pantry_id,
        type,
        location
      });

      alert("Pantry created successfully.");
      window.location.href = "pantry-list.html";
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not create pantry.");
    }
  });
}