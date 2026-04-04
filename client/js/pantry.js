// pantry.js

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
    normalizePantryItemData,
    setText
  } from "./utils.js";
  
  import { pantryAPI, pantryItemAPI } from "./api.js";
  
  // ============================
  // PAGE STATE
  // ============================
  const state = {
    studentId: null,
    pantryId: null,
    pantryItems: [],
    editingItemKey: null
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
  document.addEventListener("DOMContentLoaded", initPantryPage);
  
  async function initPantryPage() {
    cacheElements();
    bindEvents();
    initializePageState();
    await loadPantryItems();
    resetPantryFormToAddMode();
  }
  
  function cacheElements() {
    elements.form = $("#pantry-item-form");
    elements.tableBody = $("#pantry-table-body");
    elements.message = $("#pantry-message");
    elements.submitButton = $("#pantry-submit-btn");
    elements.cancelEditButton = $("#pantry-cancel-edit-btn");
    elements.formTitle = $("#pantry-form-title");
  }
  
  function bindEvents() {
    on(elements.form, "submit", handlePantryFormSubmit);
    on(elements.cancelEditButton, "click", handleCancelEdit);
  
    onDelegate(elements.tableBody, "click", '[data-action="edit"]', handleEditClick);
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeleteClick);
  }
  
  function initializePageState() {
    /*
      For now this is frontend-only.
      Later, studentId can come from:
      - auth session
      - login response
      - localStorage
      - backend token/session
  
      pantryId can come from pantryAPI.getByStudentId(studentId)
    */
  
    state.studentId = null;
    state.pantryId = null;
    state.pantryItems = [];
    state.editingItemKey = null;
  }
  
  // ============================
  // LOAD / RENDER
  // ============================
  async function loadPantryItems() {
    clearMessage(elements.message);
  
    try {
      /*
        Later real flow:
        1. get pantry assigned to current student
        2. get pantry items for that pantry
  
        Example future logic:
        const pantry = await pantryAPI.getByStudentId(state.studentId);
        state.pantryId = pantry?.pantryId ?? null;
  
        if (!state.pantryId) {
          renderEmptyState(...);
          return;
        }
  
        const items = await pantryItemAPI.getByPantryId(state.pantryId);
      */
  
      let items = [];
  
      if (state.pantryId) {
        items = await pantryItemAPI.getByPantryId(state.pantryId);
      }
  
      state.pantryItems = Array.isArray(items) ? items : [];
      renderPantryTable();
    } catch (error) {
      console.error("Failed to load pantry items:", error);
      renderEmptyState(elements.tableBody, "Unable to load pantry items.", 7);
      showMessage(elements.message, error.message || "Error loading pantry items.", "error");
    }
  }
  
  function renderPantryTable() {
    if (!elements.tableBody) return;
  
    if (!state.pantryItems.length) {
      renderEmptyState(elements.tableBody, "No pantry items available.", 7);
      return;
    }
  
    const rows = state.pantryItems.map((item) => createPantryRow(item));
    renderTableBody(elements.tableBody, rows);
  }
  
  function createPantryRow(item) {
    const actions = createActionButtons([
      {
        text: "Edit",
        className: "btn btn-edit",
        dataset: {
          action: "edit",
          pantryId: item.pantryId,
          ingredientId: item.ingredientId
        }
      },
      {
        text: "Delete",
        className: "btn btn-delete",
        dataset: {
          action: "delete",
          pantryId: item.pantryId,
          ingredientId: item.ingredientId
        }
      }
    ]);
  
    return createRow([
      item.ingredientId ?? "",
      item.quantity ?? "",
      item.unit ?? "",
      item.dateAdded ?? "",
      item.expirationDate ?? "",
      item.pantryId ?? "",
      actions
    ]);
  }
  
  // ============================
  // FORM SUBMIT
  // ============================
  async function handlePantryFormSubmit(event) {
    event.preventDefault();
    clearMessage(elements.message);
  
    try {
      const rawData = getFormData(elements.form);
      const pantryItemData = normalizePantryItemData(rawData);
  
      /*
        If pantryId is not directly in the form, use state.pantryId later.
        For now, this lets either source work.
      */
      if (!pantryItemData.pantryId && state.pantryId) {
        pantryItemData.pantryId = state.pantryId;
      }
  
      const mode = getFormMode(elements.form);
  
      if (mode === "edit") {
        await updatePantryItem(pantryItemData);
        showMessage(elements.message, "Pantry item updated successfully.", "success");
      } else {
        await createPantryItem(pantryItemData);
        showMessage(elements.message, "Pantry item added successfully.", "success");
      }
  
      await loadPantryItems();
      resetPantryFormToAddMode();
    } catch (error) {
      console.error("Failed to save pantry item:", error);
      showMessage(elements.message, error.message || "Could not save pantry item.", "error");
    }
  }
  
  async function createPantryItem(pantryItemData) {
    validatePantryItemData(pantryItemData);
    await pantryItemAPI.create(pantryItemData);
  }
  
  async function updatePantryItem(pantryItemData) {
    validatePantryItemData(pantryItemData);
  
    const editingKey = state.editingItemKey;
    if (!editingKey) {
      throw new Error("No pantry item selected for editing.");
    }
  
    await pantryItemAPI.update(
      editingKey.pantryId,
      editingKey.ingredientId,
      pantryItemData
    );
  }
  
  // ============================
  // EDIT / DELETE
  // ============================
  function handleEditClick(event, button) {
    clearMessage(elements.message);
  
    const pantryId = button.dataset.pantryId;
    const ingredientId = button.dataset.ingredientId;
  
    const selectedItem = state.pantryItems.find((item) => {
      return String(item.pantryId) === String(pantryId) &&
             String(item.ingredientId) === String(ingredientId);
    });
  
    if (!selectedItem) {
      showMessage(elements.message, "Pantry item not found.", "error");
      return;
    }
  
    state.editingItemKey = {
      pantryId: selectedItem.pantryId,
      ingredientId: selectedItem.ingredientId
    };
  
    fillForm(elements.form, {
      pantryId: selectedItem.pantryId ?? "",
      ingredientId: selectedItem.ingredientId ?? "",
      quantity: selectedItem.quantity ?? "",
      unit: selectedItem.unit ?? "",
      dateAdded: selectedItem.dateAdded ?? "",
      expirationDate: selectedItem.expirationDate ?? ""
    });
  
    setFormMode(elements.form, "edit");
    updateFormUIForMode("edit");
  }
  
  async function handleDeleteClick(event, button) {
    clearMessage(elements.message);
  
    const pantryId = button.dataset.pantryId;
    const ingredientId = button.dataset.ingredientId;
  
    try {
      await pantryItemAPI.delete(pantryId, ingredientId);
      showMessage(elements.message, "Pantry item deleted successfully.", "success");
  
      if (
        state.editingItemKey &&
        String(state.editingItemKey.pantryId) === String(pantryId) &&
        String(state.editingItemKey.ingredientId) === String(ingredientId)
      ) {
        resetPantryFormToAddMode();
      }
  
      await loadPantryItems();
    } catch (error) {
      console.error("Failed to delete pantry item:", error);
      showMessage(elements.message, error.message || "Could not delete pantry item.", "error");
    }
  }
  
  function handleCancelEdit() {
    clearMessage(elements.message);
    resetPantryFormToAddMode();
  }
  
  // ============================
  // FORM MODE / UI
  // ============================
  function resetPantryFormToAddMode() {
    resetForm(elements.form);
    setFormMode(elements.form, "add");
    state.editingItemKey = null;
    updateFormUIForMode("add");
  }
  
  function updateFormUIForMode(mode) {
    if (elements.formTitle) {
      setText(elements.formTitle, mode === "edit" ? "Edit Pantry Item" : "Add Pantry Item");
    }
  
    if (elements.submitButton) {
      setText(elements.submitButton, mode === "edit" ? "Update Item" : "Add Item");
    }
  
    if (elements.cancelEditButton) {
      elements.cancelEditButton.style.display = mode === "edit" ? "inline-block" : "none";
    }
  }
  
  // ============================
  // VALIDATION
  // ============================
  function validatePantryItemData(data) {
    if (!data.ingredientId) {
      throw new Error("Ingredient is required.");
    }
  
    if (data.quantity == null || Number.isNaN(data.quantity)) {
      throw new Error("Quantity is required and must be a valid number.");
    }
  
    if (!data.unit) {
      throw new Error("Unit is required.");
    }
  }