// ingredients.js

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
    normalizeIngredientData,
    setText
  } from "./utils.js";
  
  import { ingredientAPI } from "./api.js";
  
  // ============================
  // PAGE STATE
  // ============================
  const state = {
    ingredients: [],
    editingIngredientId: null
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
  document.addEventListener("DOMContentLoaded", initIngredientsPage);
  
  async function initIngredientsPage() {
    cacheElements();
    bindEvents();
    await loadIngredients();
    resetIngredientFormToAddMode();
  }
  
  function cacheElements() {
    elements.form = $("#ingredient-form");
    elements.tableBody = $("#ingredients-table-body");
    elements.message = $("#ingredients-message");
    elements.submitButton = $("#ingredient-submit-btn");
    elements.cancelEditButton = $("#ingredient-cancel-edit-btn");
    elements.formTitle = $("#ingredient-form-title");
  }
  
  function bindEvents() {
    on(elements.form, "submit", handleIngredientFormSubmit);
    on(elements.cancelEditButton, "click", handleCancelEdit);
  
    onDelegate(elements.tableBody, "click", '[data-action="edit"]', handleEditClick);
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeleteClick);
  }
  
  // ============================
  // LOAD / RENDER
  // ============================
  async function loadIngredients() {
    clearMessage(elements.message);
  
    try {
      const ingredients = await ingredientAPI.getAll();
      state.ingredients = Array.isArray(ingredients) ? ingredients : [];
      renderIngredientsTable();
    } catch (error) {
      console.error("Failed to load ingredients:", error);
      renderEmptyState(elements.tableBody, "Unable to load ingredients.", 8);
      showMessage(elements.message, error.message || "Error loading ingredients.", "error");
    }
  }
  
  function renderIngredientsTable() {
    if (!elements.tableBody) return;
  
    if (!state.ingredients.length) {
      renderEmptyState(elements.tableBody, "No ingredients available.", 8);
      return;
    }
  
    const rows = state.ingredients.map((ingredient) => createIngredientRow(ingredient));
    renderTableBody(elements.tableBody, rows);
  }
  
  function createIngredientRow(ingredient) {
    const actions = createActionButtons([
      {
        text: "Edit",
        className: "btn btn-edit",
        dataset: {
          action: "edit",
          ingredientId: ingredient.ingredientId
        }
      },
      {
        text: "Delete",
        className: "btn btn-delete",
        dataset: {
          action: "delete",
          ingredientId: ingredient.ingredientId
        }
      }
    ]);
  
    return createRow([
      ingredient.ingredientId ?? "",
      ingredient.name ?? "",
      ingredient.category ?? "",
      ingredient.protein ?? "",
      ingredient.calories ?? "",
      ingredient.nutritionScore ?? "",
      ingredient.imageUrl ?? "",
      actions
    ]);
  }
  
  // ============================
  // FORM SUBMIT
  // ============================
  async function handleIngredientFormSubmit(event) {
    event.preventDefault();
    clearMessage(elements.message);
  
    try {
      const rawData = getFormData(elements.form);
      const ingredientData = normalizeIngredientData(rawData);
      const mode = getFormMode(elements.form);
  
      if (mode === "edit") {
        await updateIngredient(ingredientData);
        showMessage(elements.message, "Ingredient updated successfully.", "success");
      } else {
        await createIngredient(ingredientData);
        showMessage(elements.message, "Ingredient added successfully.", "success");
      }
  
      await loadIngredients();
      resetIngredientFormToAddMode();
    } catch (error) {
      console.error("Failed to save ingredient:", error);
      showMessage(elements.message, error.message || "Could not save ingredient.", "error");
    }
  }
  
  async function createIngredient(ingredientData) {
    validateIngredientData(ingredientData);
    await ingredientAPI.create(ingredientData);
  }
  
  async function updateIngredient(ingredientData) {
    validateIngredientData(ingredientData);
  
    if (!state.editingIngredientId) {
      throw new Error("No ingredient selected for editing.");
    }
  
    await ingredientAPI.update(state.editingIngredientId, ingredientData);
  }
  
  // ============================
  // EDIT / DELETE
  // ============================
  function handleEditClick(event, button) {
    clearMessage(elements.message);
  
    const ingredientId = button.dataset.ingredientId;
  
    const selectedIngredient = state.ingredients.find((ingredient) => {
      return String(ingredient.ingredientId) === String(ingredientId);
    });
  
    if (!selectedIngredient) {
      showMessage(elements.message, "Ingredient not found.", "error");
      return;
    }
  
    state.editingIngredientId = selectedIngredient.ingredientId;
  
    fillForm(elements.form, {
      ingredientId: selectedIngredient.ingredientId ?? "",
      name: selectedIngredient.name ?? "",
      category: selectedIngredient.category ?? "",
      protein: selectedIngredient.protein ?? "",
      calories: selectedIngredient.calories ?? "",
      nutritionScore: selectedIngredient.nutritionScore ?? "",
      imageUrl: selectedIngredient.imageUrl ?? ""
    });
  
    setFormMode(elements.form, "edit");
    updateFormUIForMode("edit");
  }
  
  async function handleDeleteClick(event, button) {
    clearMessage(elements.message);
  
    const ingredientId = button.dataset.ingredientId;
  
    try {
      await ingredientAPI.delete(ingredientId);
      showMessage(elements.message, "Ingredient deleted successfully.", "success");
  
      if (String(state.editingIngredientId) === String(ingredientId)) {
        resetIngredientFormToAddMode();
      }
  
      await loadIngredients();
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
      showMessage(elements.message, error.message || "Could not delete ingredient.", "error");
    }
  }
  
  function handleCancelEdit() {
    clearMessage(elements.message);
    resetIngredientFormToAddMode();
  }
  
  // ============================
  // FORM MODE / UI
  // ============================
  function resetIngredientFormToAddMode() {
    resetForm(elements.form);
    setFormMode(elements.form, "add");
    state.editingIngredientId = null;
    updateFormUIForMode("add");
  }
  
  function updateFormUIForMode(mode) {
    if (elements.formTitle) {
      setText(
        elements.formTitle,
        mode === "edit" ? "Edit Ingredient" : "Add Ingredient"
      );
    }
  
    if (elements.submitButton) {
      setText(
        elements.submitButton,
        mode === "edit" ? "Update Ingredient" : "Add Ingredient"
      );
    }
  
    if (elements.cancelEditButton) {
      elements.cancelEditButton.style.display = mode === "edit" ? "inline-block" : "none";
    }
  }
  
  // ============================
  // VALIDATION
  // ============================
  function validateIngredientData(data) {
    if (!data.name) {
      throw new Error("Ingredient name is required.");
    }
  
    if (!data.category) {
      throw new Error("Ingredient category is required.");
    }
  
    if (data.protein != null && Number.isNaN(data.protein)) {
      throw new Error("Protein must be a valid number.");
    }
  
    if (data.calories != null && Number.isNaN(data.calories)) {
      throw new Error("Calories must be a valid number.");
    }
  
    if (data.nutritionScore != null && Number.isNaN(data.nutritionScore)) {
      throw new Error("Nutrition score must be a valid number.");
    }
  }