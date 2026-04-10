// stores.js

import {
  $,
  on,
  onDelegate,
  clearMessage,
  showMessage,
  renderTableBody,
  renderEmptyState,
  createRow,
  createActionButtons
} from "./utils.js";

import { storeAPI } from "./api.js";

// ============================
// PAGE STATE
// ============================
const state = {
  stores: [],
  filteredStores: []
};

// ============================
// DOM ELEMENTS
// ============================
const elements = {
  tableBody: null,
  message: null,
  searchInput: null
};

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", initStoresPage);

async function initStoresPage() {
  cacheElements();
  bindEvents();
  await loadStores();
}

function cacheElements() {
  elements.tableBody = $("#stores-table-body");
  elements.message = $("#stores-message");
  elements.searchInput = $("#store-search");
}

function bindEvents() {
  if (elements.searchInput) {
    on(elements.searchInput, "input", handleSearchInput);
  }


}

// ============================
// LOAD / RENDER
// ============================
async function loadStores() {
  if (!elements.tableBody) return;

  clearMessage(elements.message);

  try {
    const stores = await storeAPI.getAll();

    if (!Array.isArray(stores) || !stores.length) {
      return;
    }

    state.stores = stores;
    state.filteredStores = [...stores];
    renderStoresTable();
  } catch (error) {
    console.error("Failed to load stores:", error);
    showMessage(elements.message, "Using example store rows for now.", "error");
  }
}

function renderStoresTable() {
  if (!elements.tableBody) return;

  const storesToRender = state.filteredStores;

  if (!storesToRender.length) {
    renderEmptyState(elements.tableBody, "No stores available.", 4);
    return;
  }

  const rows = storesToRender.map((store) => createStoreRow(store));
  renderTableBody(elements.tableBody, rows);
}

function createStoreRow(store) {
  const storeId = store.storeId ?? store.store_id ?? "";
  const name = store.name ?? "";
  const address = store.address ?? "";

  const purchaseLinks = `
    <div class="action-group">
      <a href="store-purchases.html?store_id=${encodeURIComponent(storeId)}" class="btn-link-action">
        View Purchases
      </a>
      <a href="add-purchase.html?store_id=${encodeURIComponent(storeId)}" class="btn-link-action">
        Add Purchase
      </a>
    </div>
  `;



  const allActions = `
    <div class="action-group">
      ${purchaseLinks}
    </div>
  `;

  return createRow([
    storeId,
    name,
    address,
    allActions
  ]);
}

// ============================
// SEARCH
// ============================
function handleSearchInput(event) {
  const value = event.target.value.toLowerCase().trim();

  if (!state.stores.length) {
    filterExistingHtmlRows(value);
    return;
  }

  state.filteredStores = state.stores.filter((store) => {
    const storeId = String(store.storeId ?? store.store_id ?? "").toLowerCase();
    const name = String(store.name ?? "").toLowerCase();
    const address = String(store.address ?? "").toLowerCase();

    return (
      storeId.includes(value) ||
      name.includes(value) ||
      address.includes(value)
    );
  });

  renderStoresTable();
}

// ============================
// FALLBACK SEARCH FOR EXAMPLE HTML ROWS
// ============================
function filterExistingHtmlRows(searchValue) {
  const rows = elements.tableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const rowText = row.textContent.toLowerCase();
    const matches = rowText.includes(searchValue);
    row.style.display = matches ? "" : "none";
  });
}

// ============================
// ACTIONS
// ============================
function handleEditClick(event, button) {
  const storeId = button.dataset.storeId;
  showMessage(
    elements.message,
    `Edit clicked for store ${storeId}. Later this can go to edit-store.html?store_id=${storeId}`,
    "success"
  );
}

async function handleDeleteClick(event, button) {
  const storeId = button.dataset.storeId;

  try {
    await storeAPI.delete(storeId);
    showMessage(elements.message, `Store ${storeId} deleted successfully.`, "success");
    await loadStores();
  } catch (error) {
    console.error("Failed to delete store:", error);
    showMessage(
      elements.message,
      `Delete clicked for store ${storeId}. Backend delete is not ready or failed.`,
      "error"
    );
  }
}