// recipes.js

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
    createActionButtons,
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
    elements.tableBody = $("#recipes-table-body");
    elements.message = $("#recipes-message");
    elements.submitButton = $("#recipe-submit-btn");
    elements.cancelEditButton = $("#recipe-cancel-edit-btn");
    elements.formTitle = $("#recipe-form-title");
  }
  
  function bindEvents() {
    on(elements.form, "submit", handleRecipeFormSubmit);
    on(elements.cancelEditButton, "click", handleCancelEdit);
  
    onDelegate(elements.tableBody, "click", '[data-action="edit"]', handleEditClick);
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeleteClick);
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
      renderEmptyState(elements.tableBody, "Unable to load recipes.", 6);
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
    const actions = createActionButtons([
      {
        text: "Edit",
        className: "btn btn-edit",
        dataset: {
          action: "edit",
          recipeId: recipe.recipeId
        }
      },
      {
        text: "Delete",
        className: "btn btn-delete",
        dataset: {
          action: "delete",
          recipeId: recipe.recipeId
        }
      }
    ]);
  
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
  
    fillForm(elements.form, {
      recipeId: selectedRecipe.recipeId ?? "",
      name: selectedRecipe.name ?? "",
      type: selectedRecipe.type ?? "",
      servings: selectedRecipe.servings ?? "",
      totalTimePrep: selectedRecipe.totalTimePrep ?? ""
    });
  
    setFormMode(elements.form, "edit");
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
    resetForm(elements.form);
    setFormMode(elements.form, "add");
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