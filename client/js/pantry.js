// pantry.js
import { loadCurrentStudentUI } from "./currentStudent.js";
import {
  $,
  onDelegate
} from "./utils.js";

// ============================
// PAGE STATE
// ============================
const state = {
  pantries: []
};

// ============================
// DOM ELEMENTS
// ============================
const elements = {
  tableBody: null
};

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", initPantryPage);

function initPantryPage() {
  cacheElements();
  loadPantries();
  bindEvents();
}

//Delete
function bindEvents() {
  onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeletePantry);
}

function handleDeletePantry(event, button) {
  const pantryId = button.dataset.pantryId;

  state.pantries = state.pantries.filter((p) => p.pantryId !== pantryId);

  const savedPantries = JSON.parse(localStorage.getItem("pantries")) || [];
  const updatedSavedPantries = savedPantries.filter((p) => p.pantryId !== pantryId);
  localStorage.setItem("pantries", JSON.stringify(updatedSavedPantries));

  renderPantryTable();
}
function cacheElements() {
  elements.tableBody = $("#pantryTableBody");
}

// ============================
// LOAD / RENDER
// ============================
function loadPantries() {
  const defaultPantries = [
    {
      pantryId: "P001",
      type: "Fridge",
      location: "Kitchen"
    },
    {
      pantryId: "P002",
      type: "Shelf",
      location: "Pantry Room"
    },
    {
      pantryId: "P003",
      type: "Cabinet",
      location: "Dining Area"
    }
  ];

  const savedPantries = JSON.parse(localStorage.getItem("pantries")) || [];

  state.pantries = [...defaultPantries, ...savedPantries];

  renderPantryTable();
}

function renderPantryTable() {
  if (!elements.tableBody) return;

  elements.tableBody.innerHTML = "";

  if (!state.pantries.length) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="4">No pantry records available.</td>
      </tr>
    `;
    return;
  }

  state.pantries.forEach((pantry) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${pantry.pantryId}</td>
      <td>${pantry.type}</td>
      <td>${pantry.location}</td>
      <td>
      <div class="action-group">
        <a href="pantry-items.html?pantryId=${pantry.pantryId}" class="btn-secondary">
          See Pantry Items
        </a>

        <button
          class="btn btn-delete"
          data-action="delete"
          data-pantry-id="${pantry.pantryId}">
          Delete
        </button>
      </div>
    </td>
    `;

    elements.tableBody.appendChild(row);
  });
}