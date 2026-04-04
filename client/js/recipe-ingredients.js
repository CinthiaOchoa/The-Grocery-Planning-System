// recipe-ingredients.js

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
    normalizeRecipeIngredientData,
    setText
  } from "./utils.js";
  
  import { recipeAPI, ingredientAPI, recipeIngredientAPI } from "./api.js";
  
  // ============================
  // PAGE STATE
  // ============================
  const state = {
    recipes: [],
    ingredients: [],
    selectedRecipeId: null,
    recipeIngredients: [],
    editingKey: null
  };
  
  // ============================
  // DOM ELEMENTS
  // ============================
  const elements = {
    recipeSelect: null,
    form: null,
    tableBody: null,
    message: null,
    submitButton: null,
    cancelEditButton: null,
    formTitle: null,
    ingredientSelect: null
  };
  
  // ============================
  // INIT
  // ============================
  document.addEventListener("DOMContentLoaded", initRecipeIngredientsPage);
  
  async function initRecipeIngredientsPage() {
    cacheElements();
    bindEvents();
    resetFormToAddMode();
    await loadInitialData();
  }
  
  function cacheElements() {
    elements.recipeSelect = $("#recipe-ingredient-recipe-select");
    elements.form = $("#recipe-ingredient-form");
    elements.tableBody = $("#recipe-ingredients-table-body");
    elements.message = $("#recipe-ingredients-message");
    elements.submitButton = $("#recipe-ingredient-submit-btn");
    elements.cancelEditButton = $("#recipe-ingredient-cancel-edit-btn");
    elements.formTitle = $("#recipe-ingredient-form-title");
    elements.ingredientSelect = $("#ingredientId");
  }
  
  function bindEvents() {
    on(elements.recipeSelect, "change", handleRecipeSelectionChange);
    on(elements.form, "submit", handleFormSubmit);
    on(elements.cancelEditButton, "click", handleCancelEdit);
  
    onDelegate(elements.tableBody, "click", '[data-action="edit"]', handleEditClick);
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeleteClick);
  }
  
  // ============================
  // INITIAL LOAD
  // ============================
  async function loadInitialData() {
    clearMessage(elements.message);
  
    try {
      const [recipes, ingredients] = await Promise.all([
        recipeAPI.getAll(),
        ingredientAPI.getAll()
      ]);
  
      state.recipes = Array.isArray(recipes) ? recipes : [];
      state.ingredients = Array.isArray(ingredients) ? ingredients : [];
  
      populateRecipeSelect();
      populateIngredientSelect();
  
      if (!state.selectedRecipeId) {
        renderEmptyState(elements.tableBody, "Select a recipe to view its ingredients.", 4);
      }
    } catch (error) {
      console.error("Failed to load recipe ingredient page data:", error);
      renderEmptyState(elements.tableBody, "Unable to load recipe ingredient data.", 4);
      showMessage(elements.message, error.message || "Error loading page data.", "error");
    }
  }
  
  function populateRecipeSelect() {
    if (!elements.recipeSelect) return;
  
    elements.recipeSelect.innerHTML = "";
  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a recipe";
    elements.recipeSelect.appendChild(defaultOption);
  
    state.recipes.forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.recipeId;
      option.textContent = recipe.name ?? `Recipe ${recipe.recipeId}`;
      elements.recipeSelect.appendChild(option);
    });
  }
  
  function populateIngredientSelect() {
    if (!elements.ingredientSelect) return;
  
    elements.ingredientSelect.innerHTML = "";
  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select an ingredient";
    elements.ingredientSelect.appendChild(defaultOption);
  
    state.ingredients.forEach((ingredient) => {
      const option = document.createElement("option");
      option.value = ingredient.ingredientId;
      option.textContent = ingredient.name ?? `Ingredient ${ingredient.ingredientId}`;
      elements.ingredientSelect.appendChild(option);
    });
  }
  
  // ============================
  // RECIPE SELECTION
  // ============================
  async function handleRecipeSelectionChange() {
    clearMessage(elements.message);
  
    state.selectedRecipeId = elements.recipeSelect?.value || null;
    resetFormToAddMode();
    await loadRecipeIngredients();
  }
  
  async function loadRecipeIngredients() {
    if (!state.selectedRecipeId) {
      state.recipeIngredients = [];
      renderEmptyState(elements.tableBody, "Select a recipe to view its ingredients.", 4);
      return;
    }
  
    try {
      const items = await recipeIngredientAPI.getByRecipeId(state.selectedRecipeId);
      state.recipeIngredients = Array.isArray(items) ? items : [];
      renderRecipeIngredientsTable();
    } catch (error) {
      console.error("Failed to load recipe ingredients:", error);
      renderEmptyState(elements.tableBody, "Unable to load recipe ingredients.", 4);
      showMessage(elements.message, error.message || "Error loading recipe ingredients.", "error");
    }
  }
  
  // ============================
  // RENDER
  // ============================
  function renderRecipeIngredientsTable() {
    if (!elements.tableBody) return;
  
    if (!state.selectedRecipeId) {
      renderEmptyState(elements.tableBody, "Select a recipe to view its ingredients.", 4);
      return;
    }
  
    if (!state.recipeIngredients.length) {
      renderEmptyState(elements.tableBody, "No ingredients linked to this recipe.", 4);
      return;
    }
  
    const rows = state.recipeIngredients.map((item) => createRecipeIngredientRow(item));
    renderTableBody(elements.tableBody, rows);
  }
  
  function createRecipeIngredientRow(item) {
    const ingredientName = getIngredientNameById(item.ingredientId);
  
    const actions = createActionButtons([
      {
        text: "Edit",
        className: "btn btn-edit",
        dataset: {
          action: "edit",
          recipeId: item.recipeId,
          ingredientId: item.ingredientId
        }
      },
      {
        text: "Delete",
        className: "btn btn-delete",
        dataset: {
          action: "delete",
          recipeId: item.recipeId,
          ingredientId: item.ingredientId
        }
      }
    ]);
  
    return createRow([
      ingredientName,
      item.amount ?? "",
      item.unit ?? "",
      actions
    ]);
  }
  
  function getIngredientNameById(ingredientId) {
    const ingredient = state.ingredients.find((item) => {
      return String(item.ingredientId) === String(ingredientId);
    });
  
    return ingredient?.name ?? ingredientId ?? "";
  }
  
  // ============================
  // FORM SUBMIT
  // ============================
  async function handleFormSubmit(event) {
    event.preventDefault();
    clearMessage(elements.message);
  
    try {
      if (!state.selectedRecipeId) {
        throw new Error("Please select a recipe first.");
      }
  
      const rawData = getFormData(elements.form);
      const recipeIngredientData = normalizeRecipeIngredientData({
        ...rawData,
        recipeId: state.selectedRecipeId
      });
  
      const mode = getFormMode(elements.form);
  
      if (mode === "edit") {
        await updateRecipeIngredient(recipeIngredientData);
        showMessage(elements.message, "Recipe ingredient updated successfully.", "success");
      } else {
        await createRecipeIngredient(recipeIngredientData);
        showMessage(elements.message, "Recipe ingredient added successfully.", "success");
      }
  
      await loadRecipeIngredients();
      resetFormToAddMode();
    } catch (error) {
      console.error("Failed to save recipe ingredient:", error);
      showMessage(elements.message, error.message || "Could not save recipe ingredient.", "error");
    }
  }
  
  async function createRecipeIngredient(data) {
    validateRecipeIngredientData(data);
    await recipeIngredientAPI.create(data);
  }
  
  async function updateRecipeIngredient(data) {
    validateRecipeIngredientData(data);
  
    if (!state.editingKey) {
      throw new Error("No recipe ingredient selected for editing.");
    }
  
    await recipeIngredientAPI.update(
      state.editingKey.recipeId,
      state.editingKey.ingredientId,
      data
    );
  }
  
  // ============================
  // EDIT / DELETE
  // ============================
  function handleEditClick(event, button) {
    clearMessage(elements.message);
  
    const recipeId = button.dataset.recipeId;
    const ingredientId = button.dataset.ingredientId;
  
    const selectedItem = state.recipeIngredients.find((item) => {
      return String(item.recipeId) === String(recipeId) &&
             String(item.ingredientId) === String(ingredientId);
    });
  
    if (!selectedItem) {
      showMessage(elements.message, "Recipe ingredient not found.", "error");
      return;
    }
  
    state.editingKey = {
      recipeId: selectedItem.recipeId,
      ingredientId: selectedItem.ingredientId
    };
  
    fillForm(elements.form, {
      ingredientId: selectedItem.ingredientId ?? "",
      amount: selectedItem.amount ?? "",
      unit: selectedItem.unit ?? ""
    });
  
    setFormMode(elements.form, "edit");
    updateFormUIForMode("edit");
  }
  
  async function handleDeleteClick(event, button) {
    clearMessage(elements.message);
  
    const recipeId = button.dataset.recipeId;
    const ingredientId = button.dataset.ingredientId;
  
    try {
      await recipeIngredientAPI.delete(recipeId, ingredientId);
      showMessage(elements.message, "Recipe ingredient deleted successfully.", "success");
  
      if (
        state.editingKey &&
        String(state.editingKey.recipeId) === String(recipeId) &&
        String(state.editingKey.ingredientId) === String(ingredientId)
      ) {
        resetFormToAddMode();
      }
  
      await loadRecipeIngredients();
    } catch (error) {
      console.error("Failed to delete recipe ingredient:", error);
      showMessage(elements.message, error.message || "Could not delete recipe ingredient.", "error");
    }
  }
  
  function handleCancelEdit() {
    clearMessage(elements.message);
    resetFormToAddMode();
  }
  
  // ============================
  // FORM MODE / UI
  // ============================
  function resetFormToAddMode() {
    resetForm(elements.form);
    setFormMode(elements.form, "add");
    state.editingKey = null;
    updateFormUIForMode("add");
  }
  
  function updateFormUIForMode(mode) {
    if (elements.formTitle) {
      setText(
        elements.formTitle,
        mode === "edit" ? "Edit Recipe Ingredient" : "Add Recipe Ingredient"
      );
    }
  
    if (elements.submitButton) {
      setText(
        elements.submitButton,
        mode === "edit" ? "Update Recipe Ingredient" : "Add Recipe Ingredient"
      );
    }
  
    if (elements.cancelEditButton) {
      elements.cancelEditButton.style.display = mode === "edit" ? "inline-block" : "none";
    }
  
    /*
      Optional rule:
      during edit, you may want ingredientId locked so the composite key
      does not change accidentally.
    */
    if (elements.ingredientSelect) {
      elements.ingredientSelect.disabled = mode === "edit";
    }
  }
  
  // ============================
  // VALIDATION
  // ============================
  function validateRecipeIngredientData(data) {
    if (!data.recipeId) {
      throw new Error("Recipe is required.");
    }
  
    if (!data.ingredientId) {
      throw new Error("Ingredient is required.");
    }
  
    if (data.amount == null || Number.isNaN(data.amount)) {
      throw new Error("Amount is required and must be a valid number.");
    }
  
    if (!data.unit) {
      throw new Error("Unit is required.");
    }
  }