import { pantryItemAPI } from "./api.js";
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import { $, onDelegate } from "./utils.js";

const state = {
  pantryId: null,
  pantryItems: []
};

const elements = {
  tableBody: null,
  subtitle: null
};

document.addEventListener("DOMContentLoaded", initPantryItemsPage);

async function initPantryItemsPage() {
  requireAuth();
  loadCurrentStudentUI();
  cacheElements();
  bindEvents();
  readPantryIdFromUrl();
  await loadPantryItems();
}

function cacheElements() {
  elements.tableBody = $("#pantryItemsTableBody");
  elements.subtitle = $("#pantryItemsSubtitle");
}

function bindEvents() {
  if (elements.tableBody) {
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeletePantryItem);
  }
}

function readPantryIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.pantryId = params.get("pantryId");

  if (elements.subtitle && state.pantryId) {
    elements.subtitle.textContent = `View all items inside pantry ${state.pantryId}.`;
  }
}

async function loadPantryItems() {
  if (!state.pantryId || !elements.tableBody) return;

  try {
    const items = await pantryItemAPI.getByPantryId(state.pantryId);
    state.pantryItems = Array.isArray(items) ? items : [];
    renderPantryItemsTable();
  } catch (error) {
    console.error("Failed to load pantry items:", error);
    state.pantryItems = [];
    renderPantryItemsTable();
  }
}

function renderPantryItemsTable() {
  if (!elements.tableBody) return;

  elements.tableBody.innerHTML = "";

  if (!state.pantryItems.length) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="7">No pantry items found for this pantry.</td>
      </tr>
    `;
    return;
  }

  state.pantryItems.forEach((item) => {
    const pantryId = item.pantryId ?? item.pantry_id ?? "";
    const ingredientId = item.ingredientId ?? item.ingredient_id ?? "";
    const unit = item.unit ?? "";
    const quantity = item.quantity ?? "";
    const dateAdded = item.dateAdded ?? item.date_added ?? "";
    const expirationDate = item.expirationDate ?? item.expiration_date ?? "";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${pantryId}-${ingredientId}</td>
      <td>${ingredientId}</td>
      <td>${unit}</td>
      <td>${quantity}</td>
      <td>${dateAdded}</td>
      <td>${expirationDate}</td>
      <td>
        <div class="action-group">
          <span class="btn-secondary" style="opacity:0.7;">Edit later</span>
          <span class="btn-secondary" style="opacity:0.7;">Delete later</span>
        </div>
      </td>
    `;

    elements.tableBody.appendChild(row);
  });
}

function handleDeletePantryItem() {
  alert("Delete pantry item comes next. First we are finishing list + create with MySQL.");
}