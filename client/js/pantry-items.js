import { pantryItemAPI } from "./api.js";
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import { $ } from "./utils.js";

const state = {
  pantryId: null,
  pantryItems: [],
  filteredPantryItems: []
};

const elements = {
  tableBody: null,
  subtitle: null,
  searchInput: null
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
  elements.searchInput = $("#pantry-item-search");
}

function bindEvents() {
  if (elements.tableBody) {
    elements.tableBody.addEventListener("click", async (event) => {
      const button = event.target.closest('[data-action="delete"]');
      if (!button) return;

      await handleDeletePantryItem(button);
    });
  }

  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", handleSearch);
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
    state.filteredPantryItems = [...state.pantryItems];
    renderPantryItemsTable();
  } catch (error) {
    console.error("Failed to load pantry items:", error);
    state.pantryItems = [];
    state.filteredPantryItems = [];
    renderPantryItemsTable();
  }
}

function handleSearch(event) {
  const query = event.target.value.trim().toLowerCase();

  state.filteredPantryItems = state.pantryItems.filter((item) => {
    const pantryItemId = String(item.pantry_item_id ?? "").toLowerCase();
    const ingredientId = String(item.ingredient_id ?? item.ingredientId ?? "").toLowerCase();
    const unit = String(item.unit ?? "").toLowerCase();
    const quantity = String(item.quantity ?? "").toLowerCase();
    const dateAdded = String(item.date_added ?? item.dateAdded ?? "").toLowerCase();
    const expirationDate = String(item.expiration_date ?? item.expirationDate ?? "").toLowerCase();

    return (
      pantryItemId.includes(query) ||
      ingredientId.includes(query) ||
      unit.includes(query) ||
      quantity.includes(query) ||
      dateAdded.includes(query) ||
      expirationDate.includes(query)
    );
  });

  renderPantryItemsTable();
}

function renderPantryItemsTable() {
  if (!elements.tableBody) return;

  elements.tableBody.innerHTML = "";

  if (!state.filteredPantryItems.length) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="7">No pantry items found for this pantry.</td>
      </tr>
    `;
    return;
  }

  state.filteredPantryItems.forEach((item) => {
    const pantryItemId = item.pantry_item_id ?? "";
    const pantryId = item.pantryId ?? item.pantry_id ?? "";
    const ingredientId = item.ingredientId ?? item.ingredient_id ?? "";
    const unit = item.unit ?? "";
    const quantity = item.quantity ?? "";
    const rawDateAdded = item.dateAdded ?? item.date_added ?? "";
    const rawExpirationDate = item.expirationDate ?? item.expiration_date ?? "";
    
    const dateAdded = formatDate(rawDateAdded);
    const expirationDate = formatDate(rawExpirationDate);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${pantryItemId}</td>
      <td>${ingredientId}</td>
      <td>${unit}</td>
      <td>${quantity}</td>
      <td>${dateAdded}</td>
      <td>${expirationDate}</td>
      <td>
        <div class="action-group">
          <a
            href="pantry-edit-item.html?pantryItemId=${encodeURIComponent(pantryItemId)}&pantryId=${encodeURIComponent(pantryId)}&ingredientId=${encodeURIComponent(ingredientId)}&unit=${encodeURIComponent(unit)}&quantity=${encodeURIComponent(quantity)}&dateAdded=${encodeURIComponent(dateAdded)}&expirationDate=${encodeURIComponent(expirationDate)}"
            class="btn-secondary"
          >
            Edit
          </a>

          <button
            type="button"
            class="btn-secondary"
            data-action="delete"
            data-id="${pantryItemId}"
          >
            Delete
          </button>
        </div>
      </td>
    `;

    elements.tableBody.appendChild(row);
  });
}
function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().split("T")[0];
}

async function handleDeletePantryItem(button) {
  const pantryItemId = button.dataset.id;

  if (!pantryItemId) {
    alert("Pantry item id not found.");
    return;
  }

  if (!confirm("Are you sure you want to delete this pantry item?")) {
    return;
  }

  try {
    await pantryItemAPI.delete(pantryItemId);
    await loadPantryItems();
  } catch (error) {
    console.error("Delete pantry item error:", error);
    alert(error.message || "Delete failed");
  }
}
