import { recipeAPI, recipeIngredientAPI, ingredientAPI } from "./api.js";
import { loadCurrentStudentUI } from "./currentStudent.js";
const elements = {
  recipeTitle: document.getElementById("recipeTitle"),
  recipeMeta: document.getElementById("recipeMeta"),
  tableBody: document.getElementById("recipeIngredientsTableBody"),
  emptyState: document.getElementById("emptyState"),
  pageMessage: document.getElementById("pageMessage"),
  newRecipeIngredientBtn: document.getElementById("newRecipeIngredientBtn")
};

document.addEventListener("DOMContentLoaded", initRecipeIngredientsPage);

async function initRecipeIngredientsPage() {
  const recipeId = getRecipeIdFromUrl();

  if (!recipeId) {
    showError("Missing recipe_id in the URL.");
    renderEmpty();
    return;
  }

  if (elements.newRecipeIngredientBtn) {
    elements.newRecipeIngredientBtn.href =
      `new-recipe-ingredient.html?recipe_id=${encodeURIComponent(recipeId)}`;
  }

  try {
    await loadRecipeHeader(recipeId);
    await loadRecipeIngredients(recipeId);
  } catch (error) {
    console.error("Failed to load recipe ingredients page:", error);
    showError(error.message || "Could not load recipe ingredients.");
    renderEmpty();
  }
}

function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipe_id");
}

async function loadRecipeHeader(recipeId) {
  if (!recipeAPI || typeof recipeAPI.getById !== "function") {
    elements.recipeTitle.textContent = `Recipe ${recipeId}`;
    elements.recipeMeta.textContent = "Recipe information unavailable.";
    return;
  }

  const recipe = await recipeAPI.getById(recipeId);

  elements.recipeTitle.textContent = recipe?.name
    ? `${recipe.name}`
    : `Recipe ${recipeId}`;

  elements.recipeMeta.textContent =
    `Recipe ID: ${recipeId}` +
    (recipe?.type ? ` | Type: ${recipe.type}` : "") +
    (recipe?.servings != null ? ` | Servings: ${recipe.servings}` : "") +
    (recipe?.total_time_prep != null ? ` | Prep Time: ${recipe.total_time_prep}` : "") +
    (recipe?.totalTimePrep != null ? ` | Prep Time: ${recipe.totalTimePrep}` : "");
}

async function loadRecipeIngredients(recipeId) {
  let recipeIngredients = [];

  if (recipeIngredientAPI && typeof recipeIngredientAPI.getByRecipeId === "function") {
    recipeIngredients = await recipeIngredientAPI.getByRecipeId(recipeId);
  } else {
    throw new Error("recipeIngredientAPI.getByRecipeId(recipeId) is not available in api.js");
  }

  if (!Array.isArray(recipeIngredients) || recipeIngredients.length === 0) {
    renderEmpty();
    return;
  }

  const enrichedRows = await Promise.all(
    recipeIngredients.map(async (item) => {
      let ingredientName = "";

      try {
        if (ingredientAPI && typeof ingredientAPI.getById === "function") {
          const ingredient = await ingredientAPI.getById(item.ingredientId || item.ingredient_id);
          ingredientName = ingredient?.name || "";
        }
      } catch (error) {
        console.warn("Could not load ingredient name:", error);
      }

      return {
        recipeId: item.recipeId || item.recipe_id || recipeId,
        ingredientId: item.ingredientId || item.ingredient_id || "",
        ingredientName,
        amount: item.amount ?? "",
        unit: item.unit ?? ""
      };
    })
  );

  renderTable(enrichedRows);
}

function renderTable(rows) {
  elements.tableBody.innerHTML = "";
  elements.emptyState.style.display = "none";

  const html = rows.map((row) => {
    return `
      <tr>
        <td>${escapeHtml(row.recipeId)}</td>
        <td>${escapeHtml(row.ingredientId)}</td>
        <td>${escapeHtml(row.ingredientName || "-")}</td>
        <td>${escapeHtml(row.amount)}</td>
        <td>${escapeHtml(row.unit)}</td>
      </tr>
    `;
  }).join("");

  elements.tableBody.innerHTML = html;
}

function renderEmpty() {
  elements.tableBody.innerHTML = "";
  elements.emptyState.style.display = "block";
}

function showError(message) {
  if (elements.pageMessage) {
    elements.pageMessage.innerHTML = `<div class="message error">${escapeHtml(message)}</div>`;
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