import { recipeStepAPI } from "./api.js";
import { loadCurrentStudentUI } from "./currentStudent.js";
const elements = {
  form: document.getElementById("recipeStepForm"),
  recipeId: document.getElementById("recipe_id"),
  stepNumber: document.getElementById("step_number"),
  description: document.getElementById("description"),
  formMessage: document.getElementById("formMessage"),
  goBackBtn: document.getElementById("goBackBtn")
};

document.addEventListener("DOMContentLoaded", initNewRecipeStepPage);

function initNewRecipeStepPage() {
  const recipeId = getRecipeIdFromUrl();

  if (!recipeId) {
    showMessage("Missing recipe_id in URL.", "error");
    if (elements.form) elements.form.style.display = "none";
    return;
  }

  elements.recipeId.value = recipeId;
  elements.goBackBtn.href = `recipe-steps.html?recipe_id=${encodeURIComponent(recipeId)}`;

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

  const recipeId = elements.recipeId.value.trim();
  const stepNumber = Number(elements.stepNumber.value);
  const description = elements.description.value.trim();

  if (!recipeId) {
    showMessage("Recipe ID is required.", "error");
    return;
  }

  if (!stepNumber || stepNumber < 1) {
    showMessage("Step number must be 1 or greater.", "error");
    return;
  }

  if (!description) {
    showMessage("Step description is required.", "error");
    return;
  }

  try {
    await insertStepWithShift({
      recipeId,
      stepNumber,
      description
    });

    showMessage("Recipe step saved successfully.", "success");

    setTimeout(() => {
      window.location.href = `recipe-steps.html?recipe_id=${encodeURIComponent(recipeId)}`;
    }, 700);
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Could not save recipe step.", "error");
  }
}

async function insertStepWithShift({ recipeId, stepNumber, description }) {
  if (!recipeStepAPI || typeof recipeStepAPI.getRecipeStepsByRecipeId !== "function") {
    throw new Error("recipeStepAPI.getRecipeStepsByRecipeId is not available.");
  }

  if (typeof recipeStepAPI.addRecipeStep !== "function") {
    throw new Error("recipeStepAPI.addRecipeStep is not available.");
  }

  if (typeof recipeStepAPI.updateRecipeStep !== "function") {
    throw new Error("recipeStepAPI.updateRecipeStep is not available.");
  }

  let existingSteps = await recipeStepAPI.getRecipeStepsByRecipeId(recipeId);
  existingSteps = Array.isArray(existingSteps) ? existingSteps : [];

  existingSteps.sort((a, b) => {
    const aNum = Number(a.step_number ?? a.stepNumber);
    const bNum = Number(b.step_number ?? b.stepNumber);
    return bNum - aNum;
  });

  for (const step of existingSteps) {
    const currentStepNumber = Number(step.step_number ?? step.stepNumber);

    if (currentStepNumber >= stepNumber) {
      await recipeStepAPI.updateRecipeStep(recipeId, currentStepNumber, {
        step_number: currentStepNumber + 1,
        description: step.description
      });
    }
  }

  await recipeStepAPI.addRecipeStep({
    recipe_id: recipeId,
    step_number: stepNumber,
    description
  });
}

function showMessage(message, type = "error") {
  if (!elements.formMessage) return;
  elements.formMessage.innerHTML = `<div class="message ${type}">${escapeHtml(message)}</div>`;
}

function clearMessage() {
  if (elements.formMessage) {
    elements.formMessage.innerHTML = "";
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