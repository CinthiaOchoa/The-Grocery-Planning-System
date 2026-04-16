import { recipeAPI, recipeStepAPI } from "./api.js";
import { loadCurrentStudentUI } from "./currentStudent.js";
const elements = {
  recipeTitle: document.getElementById("recipeTitle"),
  recipeSubtitle: document.getElementById("recipeSubtitle"),
  metaRecipeId: document.getElementById("metaRecipeId"),
  metaStepCount: document.getElementById("metaStepCount"),
  stepsList: document.getElementById("recipeStepsList"),
  emptyState: document.getElementById("emptyState"),
  pageMessage: document.getElementById("pageMessage"),
  newStepBtn: document.getElementById("newStepBtn")
};

document.addEventListener("DOMContentLoaded", initRecipeStepsPage);

async function initRecipeStepsPage() {
  const recipeId = getRecipeIdFromUrl();

  if (!recipeId) {
    showMessage("Missing recipe_id in URL.", "error");
    renderEmpty();
    return;
  }

  if (elements.newStepBtn) {
    elements.newStepBtn.href = `new-recipe-step.html?recipe_id=${encodeURIComponent(recipeId)}`;
  }

  await loadRecipeInfo(recipeId);
  await loadRecipeSteps(recipeId);
}

function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipe_id");
}

async function loadRecipeInfo(recipeId) {
  try {
    let recipe = null;

    if (recipeAPI && typeof recipeAPI.getById === "function") {
      recipe = await recipeAPI.getById(recipeId);
    }

    elements.recipeTitle.textContent = recipe?.name || "Recipe Steps";
    elements.recipeSubtitle.textContent = recipe?.type
      ? `Instructions for ${recipe.type} recipe`
      : "Review the ordered cooking instructions for this recipe.";
    elements.metaRecipeId.textContent = `Recipe ID: ${recipeId}`;
  } catch (error) {
    elements.recipeTitle.textContent = "Recipe Steps";
    elements.recipeSubtitle.textContent = "Recipe information could not be loaded.";
    elements.metaRecipeId.textContent = `Recipe ID: ${recipeId}`;
  }
}

async function loadRecipeSteps(recipeId) {
  try {
    let steps = [];

    if (recipeStepAPI && typeof recipeStepAPI.getRecipeStepsByRecipeId === "function") {
      steps = await recipeStepAPI.getRecipeStepsByRecipeId(recipeId);
    }

    steps = Array.isArray(steps) ? steps : [];
    steps.sort((a, b) => Number(a.step_number ?? a.stepNumber) - Number(b.step_number ?? b.stepNumber));

    elements.metaStepCount.textContent = `Steps: ${steps.length}`;

    if (!steps.length) {
      renderEmpty();
      return;
    }

    renderSteps(steps);
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Could not load recipe steps.", "error");
    renderEmpty();
  }
}

function renderSteps(steps) {
  elements.stepsList.innerHTML = "";
  elements.emptyState.style.display = "none";

  const html = steps.map((step) => {
    const stepNumber = step.step_number ?? step.stepNumber ?? "";
    const description = step.description ?? "";

    return `
      <article class="step-card">
        <div class="step-number">${escapeHtml(stepNumber)}</div>
        <div class="step-content">
          <h4>Step ${escapeHtml(stepNumber)}</h4>
          <p>${escapeHtml(description)}</p>
        </div>
      </article>
    `;
  }).join("");

  elements.stepsList.innerHTML = html;
}

function renderEmpty() {
  elements.stepsList.innerHTML = "";
  elements.emptyState.style.display = "flex";
}

function showMessage(message, type = "error") {
  if (!elements.pageMessage) return;
  elements.pageMessage.innerHTML = `<div class="message ${type}">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}