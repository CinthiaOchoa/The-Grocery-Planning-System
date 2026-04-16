import { recipeIngredientAPI } from "./api.js";
import { loadCurrentStudentUI } from "./currentStudent.js";
const elements = {
  form: document.getElementById("recipeIngredientForm"),
  recipeId: document.getElementById("recipe_id"),
  ingredientId: document.getElementById("ingredient_id"),
  amount: document.getElementById("amount"),
  unit: document.getElementById("unit"),
  message: document.getElementById("recipeIngredientMessage"),
  goBackBtn: document.getElementById("goBackBtn")
};

document.addEventListener("DOMContentLoaded", initNewRecipeIngredientPage);

function initNewRecipeIngredientPage() {
  const recipeId = getRecipeIdFromUrl();

  if (!recipeId) {
    showMessage("Missing recipe_id in URL.", "error");
    if (elements.form) elements.form.style.display = "none";
    return;
  }

  elements.recipeId.value = recipeId;
  elements.goBackBtn.href = `recipe-ingredients.html?recipe_id=${encodeURIComponent(recipeId)}`;

  if (elements.form) {
    elements.form.addEventListener("submit", handleSubmit);
  }
}

function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipe_id");
}

async function handleSubmit(event) {
  event.preventDefault();
  clearMessage();

  const recipeIngredientData = {
    recipe_id: elements.recipeId.value.trim(),
    ingredient_id: elements.ingredientId.value.trim(),
    amount: Number(elements.amount.value),
    unit: elements.unit.value.trim()
  };

  try {
    validateRecipeIngredient(recipeIngredientData);

    if (!recipeIngredientAPI || typeof recipeIngredientAPI.create !== "function") {
      throw new Error("recipeIngredientAPI.create is not available in api.js");
    }

    await recipeIngredientAPI.create(recipeIngredientData);

    showMessage("Recipe ingredient saved successfully.", "success");

    setTimeout(() => {
      window.location.href =
        `recipe-ingredients.html?recipe_id=${encodeURIComponent(recipeIngredientData.recipe_id)}`;
    }, 700);
  } catch (error) {
    console.error("Failed to save recipe ingredient:", error);
    showMessage(error.message || "Could not save recipe ingredient.", "error");
  }
}

function validateRecipeIngredient(data) {
  if (!data.recipe_id) {
    throw new Error("Recipe ID is required.");
  }

  if (!data.ingredient_id) {
    throw new Error("Ingredient ID is required.");
  }

  if (Number.isNaN(data.amount)) {
    throw new Error("Amount must be a valid number.");
  }

  if (!data.unit) {
    throw new Error("Unit is required.");
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