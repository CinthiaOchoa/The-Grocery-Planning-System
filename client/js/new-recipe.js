import { recipeAPI } from "./api.js";
import { loadCurrentStudentUI } from "./currentStudent.js";
const elements = {
  form: document.getElementById("recipeForm"),
  message: document.getElementById("recipeMessage"),
  recipeId: document.getElementById("recipe_id"),
  name: document.getElementById("name"),
  type: document.getElementById("type"),
  servings: document.getElementById("servings"),
  totalTimePrep: document.getElementById("total_time_prep")
};

document.addEventListener("DOMContentLoaded", initNewRecipePage);

function initNewRecipePage() {
  if (!elements.form) return;
  elements.form.addEventListener("submit", handleSubmit);
}

async function handleSubmit(event) {
  event.preventDefault();
  clearMessage();

  const recipeData = {
    recipe_id: elements.recipeId.value.trim(),
    name: elements.name.value.trim(),
    type: elements.type.value.trim(),
    servings: Number(elements.servings.value),
    total_time_prep: Number(elements.totalTimePrep.value)
  };

  try {
    validateRecipe(recipeData);

    if (!recipeAPI || typeof recipeAPI.createRecipe !== "function") {
      throw new Error("recipeAPI.createRecipe is not available in api.js");
    }

    await recipeAPI.createRecipe(recipeData);

    showMessage("Recipe saved successfully.", "success");

    setTimeout(() => {
      window.location.href = "recipes-list.html";
    }, 700);
  } catch (error) {
    console.error("Failed to save recipe:", error);
    showMessage(error.message || "Could not save recipe.", "error");
  }
}

function validateRecipe(data) {
  if (!data.recipe_id) {
    throw new Error("Recipe ID is required.");
  }

  if (!data.name) {
    throw new Error("Recipe name is required.");
  }

  if (!data.type) {
    throw new Error("Recipe type is required.");
  }

  if (!Number.isInteger(data.servings) || data.servings < 1) {
    throw new Error("Servings must be a valid number greater than 0.");
  }

  if (!Number.isInteger(data.total_time_prep) || data.total_time_prep < 1) {
    throw new Error("Total preparation time must be a valid number greater than 0.");
  }
}

function showMessage(message, type = "error") {
  if (!elements.message) return;
  elements.message.innerHTML = `<div class="message ${type}">${escapeHtml(message)}</div>`;
}

function clearMessage() {
  if (elements.message) {
    elements.message.innerHTML = "";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}