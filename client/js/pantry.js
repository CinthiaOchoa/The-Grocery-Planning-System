import { pantryAPI } from "./api.js";
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import { $, onDelegate } from "./utils.js";

const state = {
  pantries: [],
  filteredPantries: []
};

const elements = {
  tableBody: null
};

document.addEventListener("DOMContentLoaded", initPantryPage);

async function initPantryPage() {
  requireAuth();
  loadCurrentStudentUI();
  cacheElements();
  bindEvents();
  await loadPantries();
}

function cacheElements() {
  elements.tableBody = $("#pantryTableBody");
  elements.searchInput = $("#pantry-search");
}

function bindEvents() {
  if (elements.tableBody) {
    onDelegate(elements.tableBody, "click", '[data-action="delete"]', handleDeletePantry);
  }
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", handleSearch);
  }
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase();

  state.filteredPantries = state.pantries.filter((p) => {
    const pantryId = (p.pantryId ?? p.pantry_id ?? "").toString().toLowerCase();
    const type = (p.type ?? "").toLowerCase();
    const location = (p.location ?? "").toLowerCase();

    return (
      pantryId.includes(query) ||
      type.includes(query) ||
      location.includes(query)
    );
  });

  renderPantryTable();
}


async function loadPantries() {
  try {
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    const studentId = currentStudent?.student_id;
    
    const pantries = await pantryAPI.getByStudentId(studentId);
    
    state.pantries = Array.isArray(pantries) ? pantries : [];
    state.filteredPantries = [...state.pantries];
    renderPantryTable();
  } catch (error) {
    console.error("Failed to load pantries:", error);
    renderPantryTable();
  }
}

function renderPantryTable() {
  if (!elements.tableBody) return;

  elements.tableBody.innerHTML = "";

  if (!state.filteredPantries.length) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="4">No pantry records available.</td>
      </tr>
    `;
    return;
  }

  state.filteredPantries.forEach((pantry) => {
    const pantryId = pantry.pantryId ?? pantry.pantry_id ?? "";
    const type = pantry.type ?? "";
    const location = pantry.location ?? "";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${pantryId}</td>
      <td>${type}</td>
      <td>${location}</td>
      <td>
        <div class="action-group">
          <a href="pantry-items.html?pantryId=${encodeURIComponent(pantryId)}" class="btn-secondary">
            See Pantry Items
          </a>
        </div>
      </td>
    `;

    elements.tableBody.appendChild(row);
  });
}

function handleDeletePantry() {
  alert("Delete pantry can be added later. For now we are only connecting pantry list + create pantry.");
}