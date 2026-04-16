import { recipeIngredientAPI, ingredientAPI } from "./api.js";
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";

const elements = {
  form: document.getElementById("recipeIngredientForm"),
  recipeId: document.getElementById("recipe_id"),
  ingredientSelect: document.getElementById("ingredient_select"),
  ingredientId: document.getElementById("ingredient_id"),
  amount: document.getElementById("amount"),
  unit: document.getElementById("unit"),
  message: document.getElementById("recipeIngredientMessage"),
  goBackBtn: document.getElementById("goBackBtn")
};

document.addEventListener("DOMContentLoaded", initNewRecipeIngredientPage);

async function initNewRecipeIngredientPage() {
  requireAuth();
  loadCurrentStudentUI();

  const recipeId = getRecipeIdFromUrl();

  if (!recipeId) {
    showMessage("Missing recipe_id in URL.", "error");
    if (elements.form) elements.form.style.display = "none";
    return;
  }

  elements.recipeId.value = recipeId;
  elements.goBackBtn.href = `recipe-ingredients.html?recipe_id=${encodeURIComponent(recipeId)}`;

  await loadIngredientOptions();

  if (elements.ingredientSelect) {
    elements.ingredientSelect.addEventListener("change", handleIngredientChange);
  }

  if (elements.form) {
    elements.form.addEventListener("submit", handleSubmit);
    elements.form.addEventListener("reset", handleReset);
  }
}

function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipe_id");
}

async function loadIngredientOptions() {
  if (!elements.ingredientSelect) return;

  try {
    const ingredients = await ingredientAPI.getAll();

    elements.ingredientSelect.innerHTML = `<option value="">Select ingredient</option>`;

    ingredients.forEach((ingredient) => {
      const ingredientId = ingredient.ingredient_id ?? ingredient.ingredientId ?? "";
      const name = ingredient.name ?? "";

      const option = document.createElement("option");
      option.value = ingredientId;
      option.textContent = `${name} (${ingredientId})`;

      elements.ingredientSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load ingredients:", error);
    showMessage("Could not load ingredient list.", "error");
  }
}

function handleIngredientChange() {
  if (!elements.ingredientId || !elements.ingredientSelect) return;
  elements.ingredientId.value = elements.ingredientSelect.value || "";
}

function handleReset() {
  setTimeout(() => {
    if (elements.ingredientSelect) {
      elements.ingredientSelect.selectedIndex = 0;
    }

    if (elements.ingredientId) {
      elements.ingredientId.value = "";
    }
  }, 0);
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
    throw new Error("Ingredient is required.");
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
  elements.message.innerHTML = `<div class="message ${escapeHtml(type)}">${escapeHtml(message)}</div>`;
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