// stores.js

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
    normalizeStoreData,
    setText
  } from "./utils.js";
  
  import { storeAPI } from "./api.js";
  
  // ============================
  // PAGE STATE
  // ============================
  const state = {
    stores: [],
    editingStoreId: null
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
  document.addEventListener("DOMContentLoaded", initStoresPage);
  
  async function initStoresPage() {
    cacheElements();
    bindEvents();
    await loadStores();
    resetStoreFormToAddMode();
  }
  
  function cacheElements() {
    elements.form = $("#store-form");
    elements.tableBody = $("#stores-table-body");
    elements.message = $("#stores-message");
    elements.submitButton = $("#store-submit-btn");
    elements.cancelEditButton = $("#store-cancel-edit-btn");
    elements.formTitle = $("#store-form-title");
  }
  
  function bindEvents() {
    on(elements.form, "submit", handleStoreFormSubmit);
    on(elements.cancelEditButton, "click", handleCancelEdit);
  
    onDelegate(elements.tableBody, "click", '[data-action="edit"]', handleEditClick);
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeleteClick);
  }
  
  // ============================
  // LOAD / RENDER
  // ============================
  async function loadStores() {
    clearMessage(elements.message);
  
    try {
      const stores = await storeAPI.getAll();
      state.stores = Array.isArray(stores) ? stores : [];
      renderStoresTable();
    } catch (error) {
      console.error("Failed to load stores:", error);
      renderEmptyState(elements.tableBody, "Unable to load stores.", 4);
      showMessage(elements.message, error.message || "Error loading stores.", "error");
    }
  }
  
  function renderStoresTable() {
    if (!elements.tableBody) return;
  
    if (!state.stores.length) {
      renderEmptyState(elements.tableBody, "No stores available.", 4);
      return;
    }
  
    const rows = state.stores.map((store) => createStoreRow(store));
    renderTableBody(elements.tableBody, rows);
  }
  
  function createStoreRow(store) {
    const actions = createActionButtons([
      {
        text: "Edit",
        className: "btn btn-edit",
        dataset: {
          action: "edit",
          storeId: store.storeId
        }
      },
      {
        text: "Delete",
        className: "btn btn-delete",
        dataset: {
          action: "delete",
          storeId: store.storeId
        }
      }
    ]);
  
    return createRow([
      store.storeId ?? "",
      store.name ?? "",
      store.address ?? "",
      actions
    ]);
  }
  
  // ============================
  // FORM SUBMIT
  // ============================
  async function handleStoreFormSubmit(event) {
    event.preventDefault();
    clearMessage(elements.message);
  
    try {
      const rawData = getFormData(elements.form);
      const storeData = normalizeStoreData(rawData);
      const mode = getFormMode(elements.form);
  
      if (mode === "edit") {
        await updateStore(storeData);
        showMessage(elements.message, "Store updated successfully.", "success");
      } else {
        await createStore(storeData);
        showMessage(elements.message, "Store added successfully.", "success");
      }
  
      await loadStores();
      resetStoreFormToAddMode();
    } catch (error) {
      console.error("Failed to save store:", error);
      showMessage(elements.message, error.message || "Could not save store.", "error");
    }
  }
  
  async function createStore(storeData) {
    validateStoreData(storeData);
    await storeAPI.create(storeData);
  }
  
  async function updateStore(storeData) {
    validateStoreData(storeData);
  
    if (!state.editingStoreId) {
      throw new Error("No store selected for editing.");
    }
  
    await storeAPI.update(state.editingStoreId, storeData);
  }
  
  // ============================
  // EDIT / DELETE
  // ============================
  function handleEditClick(event, button) {
    clearMessage(elements.message);
  
    const storeId = button.dataset.storeId;
  
    const selectedStore = state.stores.find((store) => {
      return String(store.storeId) === String(storeId);
    });
  
    if (!selectedStore) {
      showMessage(elements.message, "Store not found.", "error");
      return;
    }
  
    state.editingStoreId = selectedStore.storeId;
  
    fillForm(elements.form, {
      storeId: selectedStore.storeId ?? "",
      name: selectedStore.name ?? "",
      address: selectedStore.address ?? ""
    });
  
    setFormMode(elements.form, "edit");
    updateFormUIForMode("edit");
  }
  
  async function handleDeleteClick(event, button) {
    clearMessage(elements.message);
  
    const storeId = button.dataset.storeId;
  
    try {
      await storeAPI.delete(storeId);
      showMessage(elements.message, "Store deleted successfully.", "success");
  
      if (String(state.editingStoreId) === String(storeId)) {
        resetStoreFormToAddMode();
      }
  
      await loadStores();
    } catch (error) {
      console.error("Failed to delete store:", error);
      showMessage(elements.message, error.message || "Could not delete store.", "error");
    }
  }
  
  function handleCancelEdit() {
    clearMessage(elements.message);
    resetStoreFormToAddMode();
  }
  
  // ============================
  // FORM MODE / UI
  // ============================
  function resetStoreFormToAddMode() {
    resetForm(elements.form);
    setFormMode(elements.form, "add");
    state.editingStoreId = null;
    updateFormUIForMode("add");
  }
  
  function updateFormUIForMode(mode) {
    if (elements.formTitle) {
      setText(
        elements.formTitle,
        mode === "edit" ? "Edit Store" : "Add Store"
      );
    }
  
    if (elements.submitButton) {
      setText(
        elements.submitButton,
        mode === "edit" ? "Update Store" : "Add Store"
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
  function validateStoreData(data) {
    if (!data.name) {
      throw new Error("Store name is required.");
    }
  
    if (!data.address) {
      throw new Error("Store address is required.");
    }
  }