import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import {
  $,
  on,
  clearMessage,
  showMessage,
  renderEmptyState
} from "./utils.js";

import { recipeAPI } from "./api.js";

const state = {
  recipes: [],
  filteredRecipes: []
};

const elements = {
  tableBody: null,
  message: null,
  searchInput: null
};

document.addEventListener("DOMContentLoaded", initRecipesPage);

async function initRecipesPage() {
  requireAuth();
  loadCurrentStudentUI();
  cacheElements();
  bindEvents();
  await loadRecipes();
}

function cacheElements() {
  elements.tableBody = $("#recipesTableBody");
  elements.message = $("#recipes-message");
  elements.searchInput = $("#recipe-search");
}

function bindEvents() {
  if (elements.searchInput) {
    on(elements.searchInput, "input", handleSearchInput);
  }

  if (elements.tableBody) {
    elements.tableBody.addEventListener("click", async (event) => {
      const editButton = event.target.closest('[data-action="edit"]');
      const deleteButton = event.target.closest('[data-action="delete"]');

      if (editButton) {
        handleEditClick(editButton);
        return;
      }

      if (deleteButton) {
        await handleDeleteClick(deleteButton);
      }
    });
  }
}

async function loadRecipes() {
  clearMessage(elements.message);

  try {
    const recipes = await recipeAPI.getAll();
    state.recipes = Array.isArray(recipes) ? recipes : [];
    state.filteredRecipes = [...state.recipes];
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

  if (!state.filteredRecipes.length) {
    renderEmptyState(elements.tableBody, "No recipes available.", 6);
    return;
  }

  elements.tableBody.innerHTML = state.filteredRecipes
    .map((recipe) => createRecipeRow(recipe))
    .join("");
}

function createRecipeRow(recipe) {
  const recipeId = recipe.recipeId ?? recipe.recipe_id ?? "";
  const totalTimePrep = recipe.totalTimePrep ?? recipe.total_time_prep ?? "";

  return `
    <tr>
      <td>${escapeHtml(recipeId)}</td>
      <td>${escapeHtml(recipe.name ?? "")}</td>
      <td>${escapeHtml(recipe.type ?? "")}</td>
      <td>${escapeHtml(recipe.servings ?? "")}</td>
      <td>${escapeHtml(totalTimePrep)}</td>
      <td>
        <div class="action-buttons">
          <a href="recipe-ingredients.html?recipe_id=${encodeURIComponent(recipeId)}" class="btn-small btn-ingredients">
            View Ingredients
          </a>
          <a href="recipe-steps.html?recipe_id=${encodeURIComponent(recipeId)}" class="btn-small btn-steps">
            View Steps
          </a>
        </div>
      </td>
    </tr>
  `;
}

function handleSearchInput(event) {
  const value = event.target.value.toLowerCase().trim();

  state.filteredRecipes = state.recipes.filter((recipe) => {
    const recipeId = String(recipe.recipeId ?? recipe.recipe_id ?? "").toLowerCase();
    const name = String(recipe.name ?? "").toLowerCase();
    const type = String(recipe.type ?? "").toLowerCase();
    const servings = String(recipe.servings ?? "").toLowerCase();
    const totalTimePrep = String(recipe.totalTimePrep ?? recipe.total_time_prep ?? "").toLowerCase();

    return (
      recipeId.includes(value) ||
      name.includes(value) ||
      type.includes(value) ||
      servings.includes(value) ||
      totalTimePrep.includes(value)
    );
  });

  renderRecipesTable();
}



function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}