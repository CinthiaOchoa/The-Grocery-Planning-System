// pantry-items.js

import { $, onDelegate } from "./utils.js";
import { loadCurrentStudentUI } from "./currentStudent.js";
const state = {
  pantryId: null,
  pantryItems: []
};

const elements = {
  tableBody: null,
  subtitle: null
};

document.addEventListener("DOMContentLoaded", initPantryItemsPage);

function initPantryItemsPage() {
  cacheElements();
  bindEvents();
  readPantryIdFromUrl();
  loadPantryItems();
  renderPantryItemsTable();
}

function cacheElements() {
  elements.tableBody = $("#pantryItemsTableBody");
  elements.subtitle = $("#pantryItemsSubtitle");
}

function bindEvents() {
  onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeletePantryItem);
}

function readPantryIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.pantryId = params.get("pantryId");

  if (elements.subtitle && state.pantryId) {
    elements.subtitle.textContent = `View all items inside pantry ${state.pantryId}.`;
  }
}

function loadPantryItems() {
  const defaultPantryItems = [
    {
      pantryItemId: "PI001",
      pantryId: "P001",
      ingredientId: "ING001",
      unit: "kg",
      dateAdded: "2026-04-05",
      expirationDate: "2026-04-10",
      quantity: 2
    },
    {
      pantryItemId: "PI002",
      pantryId: "P001",
      ingredientId: "ING003",
      unit: "pcs",
      dateAdded: "2026-04-03",
      expirationDate: "2026-04-12",
      quantity: 6
    },
    {
      pantryItemId: "PI003",
      pantryId: "P002",
      ingredientId: "ING002",
      unit: "liters",
      dateAdded: "2026-04-01",
      expirationDate: "2026-04-20",
      quantity: 1
    }
  ];

  const savedPantryItems = JSON.parse(localStorage.getItem("pantryItems")) || [];

  state.pantryItems = [...defaultPantryItems, ...savedPantryItems].filter(
    (item) => item.pantryId === state.pantryId
  );
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
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.pantryItemId}</td>
      <td>${item.ingredientId}</td>
      <td>${item.unit}</td>
      <td>${item.quantity}</td>
      <td>${item.dateAdded}</td>
      <td>${item.expirationDate}</td>
      <td>
        <div class="action-group">
          <a
            href="pantry-edit-item.html?pantryItemId=${encodeURIComponent(item.pantryItemId)}&pantryId=${encodeURIComponent(item.pantryId)}&ingredientId=${encodeURIComponent(item.ingredientId)}&unit=${encodeURIComponent(item.unit)}&quantity=${encodeURIComponent(item.quantity)}&dateAdded=${encodeURIComponent(item.dateAdded)}&expirationDate=${encodeURIComponent(item.expirationDate)}"
            class="btn-secondary">
            Edit
          </a>

          <button
            type="button"
            class="btn btn-delete"
            data-action="delete"
            data-pantry-item-id="${item.pantryItemId}">
            Delete
          </button>
        </div>
      </td>
    `;

    elements.tableBody.appendChild(row);
  });
}

function handleDeletePantryItem(event, button) {
  const pantryItemId = button.dataset.pantryItemId;

  state.pantryItems = state.pantryItems.filter(
    (item) => item.pantryItemId !== pantryItemId
  );

  const savedPantryItems = JSON.parse(localStorage.getItem("pantryItems")) || [];
  const updatedSavedPantryItems = savedPantryItems.filter(
    (item) => item.pantryItemId !== pantryItemId
  );
  localStorage.setItem("pantryItems", JSON.stringify(updatedSavedPantryItems));

  renderPantryItemsTable();
}