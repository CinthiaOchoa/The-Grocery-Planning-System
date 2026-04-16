// recipes.js
import { loadCurrentStudentUI } from "./currentStudent.js";
import {
  $,
  on,
  onDelegate,
  getFormData,
  resetForm,
  fillForm,
  setFormMode,
  getFormMode,
  clearMessage,
  showMessage,
  renderTableBody,
  renderEmptyState,
  createRow,
  normalizeRecipeData,
  setText
} from "./utils.js";

import { recipeAPI } from "./api.js";

// ============================
// PAGE STATE
// ============================
const state = {
  recipes: [],
  editingRecipeId: null
};

// ============================
// DOM ELEMENTS
// ============================
const elements = {
  form: null,
  tableBody: null,
  message: null,
  submitButton: null,
  cancelEditButton: null,
  formTitle: null
};

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", initRecipesPage);

async function initRecipesPage() {
  cacheElements();
  bindEvents();
  await loadRecipes();
  resetRecipeFormToAddMode();
}

function cacheElements() {
  elements.form = $("#recipe-form");
  elements.tableBody = $("#recipesTableBody"); // fixed to match HTML
  elements.message = $("#recipes-message");
  elements.submitButton = $("#recipe-submit-btn");
  elements.cancelEditButton = $("#recipe-cancel-edit-btn");
  elements.formTitle = $("#recipe-form-title");
}

function bindEvents() {
  if (elements.form) {
    on(elements.form, "submit", handleRecipeFormSubmit);
  }

  if (elements.cancelEditButton) {
    on(elements.cancelEditButton, "click", handleCancelEdit);
  }

  if (elements.tableBody) {
    onDelegate(elements.tableBody, "click", '[data-action="edit"]', handleEditClick);
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeleteClick);
  }
}

// ============================
// LOAD / RENDER
// ============================
async function loadRecipes() {
  clearMessage(elements.message);

  try {
    const recipes = await recipeAPI.getAll();
    state.recipes = Array.isArray(recipes) ? recipes : [];
    renderRecipesTable();
  } catch (error) {
    console.error("Failed to load recipes:", error);

    if (elements.tableBody) {
      renderEmptyState(elements.tableBody, "Unable to load recipes.", 6);
    }

    showMessage(elements.message, error.message || "Error loading recipes.", "error");
  }
}

function renderRecipesTable() {
  if (!elements.tableBody) return;

  if (!state.recipes.length) {
    renderEmptyState(elements.tableBody, "No recipes available.", 6);
    return;
  }

  const rows = state.recipes.map((recipe) => createRecipeRow(recipe));
  renderTableBody(elements.tableBody, rows);
}

function createRecipeRow(recipe) {
  const recipeId = recipe.recipeId ?? "";

  const actions = `
    <div class="action-buttons">
      <a href="recipe-ingredients.html?recipe_id=${encodeURIComponent(recipeId)}" class="btn-small btn-ingredients">
        View Ingredients
      </a>
      <a href="recipe-steps.html?recipe_id=${encodeURIComponent(recipeId)}" class="btn-small btn-steps">
        View Steps
      </a>
      <button
        type="button"
        class="btn btn-edit"
        data-action="edit"
        data-recipe-id="${recipeId}">
        Edit
      </button>
      <button
        type="button"
        class="btn btn-delete"
        data-action="delete"
        data-recipe-id="${recipeId}">
        Delete
      </button>
    </div>
  `;

  return createRow([
    recipe.recipeId ?? "",
    recipe.name ?? "",
    recipe.type ?? "",
    recipe.servings ?? "",
    recipe.totalTimePrep ?? "",
    actions
  ]);
}

// ============================
// FORM SUBMIT
// ============================
async function handleRecipeFormSubmit(event) {
  event.preventDefault();
  clearMessage(elements.message);

  try {
    const rawData = getFormData(elements.form);
    const recipeData = normalizeRecipeData(rawData);
    const mode = getFormMode(elements.form);

    if (mode === "edit") {
      await updateRecipe(recipeData);
      showMessage(elements.message, "Recipe updated successfully.", "success");
    } else {
      await createRecipe(recipeData);
      showMessage(elements.message, "Recipe added successfully.", "success");
    }

    await loadRecipes();
    resetRecipeFormToAddMode();
  } catch (error) {
    console.error("Failed to save recipe:", error);
    showMessage(elements.message, error.message || "Could not save recipe.", "error");
  }
}

async function createRecipe(recipeData) {
  validateRecipeData(recipeData);
  await recipeAPI.create(recipeData);
}

async function updateRecipe(recipeData) {
  validateRecipeData(recipeData);

  if (!state.editingRecipeId) {
    throw new Error("No recipe selected for editing.");
  }

  await recipeAPI.update(state.editingRecipeId, recipeData);
}

// ============================
// EDIT / DELETE
// ============================
function handleEditClick(event, button) {
  clearMessage(elements.message);

  const recipeId = button.dataset.recipeId;

  const selectedRecipe = state.recipes.find((recipe) => {
    return String(recipe.recipeId) === String(recipeId);
  });

  if (!selectedRecipe) {
    showMessage(elements.message, "Recipe not found.", "error");
    return;
  }

  state.editingRecipeId = selectedRecipe.recipeId;

  if (elements.form) {
    fillForm(elements.form, {
      recipeId: selectedRecipe.recipeId ?? "",
      name: selectedRecipe.name ?? "",
      type: selectedRecipe.type ?? "",
      servings: selectedRecipe.servings ?? "",
      totalTimePrep: selectedRecipe.totalTimePrep ?? ""
    });

    setFormMode(elements.form, "edit");
  }

  updateFormUIForMode("edit");
}

async function handleDeleteClick(event, button) {
  clearMessage(elements.message);

  const recipeId = button.dataset.recipeId;

  try {
    await recipeAPI.delete(recipeId);
    showMessage(elements.message, "Recipe deleted successfully.", "success");

    if (String(state.editingRecipeId) === String(recipeId)) {
      resetRecipeFormToAddMode();
    }

    await loadRecipes();
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    showMessage(elements.message, error.message || "Could not delete recipe.", "error");
  }
}

function handleCancelEdit() {
  clearMessage(elements.message);
  resetRecipeFormToAddMode();
}

// ============================
// FORM MODE / UI
// ============================
function resetRecipeFormToAddMode() {
  if (elements.form) {
    resetForm(elements.form);
    setFormMode(elements.form, "add");
  }

  state.editingRecipeId = null;
  updateFormUIForMode("add");
}

function updateFormUIForMode(mode) {
  if (elements.formTitle) {
    setText(
      elements.formTitle,
      mode === "edit" ? "Edit Recipe" : "Add Recipe"
    );
  }

  if (elements.submitButton) {
    setText(
      elements.submitButton,
      mode === "edit" ? "Update Recipe" : "Add Recipe"
    );
  }

  if (elements.cancelEditButton) {
    elements.cancelEditButton.style.display =
      mode === "edit" ? "inline-block" : "none";
  }
}

// ============================
// VALIDATION
// ============================
function validateRecipeData(data) {
  if (!data.name) {
    throw new Error("Recipe name is required.");
  }

  if (!data.type) {
    throw new Error("Recipe type is required.");
  }

  if (data.servings == null || Number.isNaN(data.servings)) {
    throw new Error("Servings is required and must be a valid number.");
  }

  if (data.totalTimePrep == null || Number.isNaN(data.totalTimePrep)) {
    throw new Error("Total prep time is required and must be a valid number.");
  }
}