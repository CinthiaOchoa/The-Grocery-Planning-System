import { requireAuth } from "./currentStudent.js";
import {
  $,
  on,
  getFormData,
  clearMessage,
  showMessage,
  setText
} from "./utils.js";

import { loadCurrentStudentUI } from "./currentStudent.js";

// ============================
// PAGE STATE
// ============================
const state = {
  currentStudentId: null,
  currentStudent: null,
  selectedTheme: "light"
};

// ============================
// DOM ELEMENTS
// ============================
const elements = {
  form: null,
  message: null,
  pageTitle: null,
  themePreviewText: null,
  themeInput: null,
  lightModeBtn: null,
  darkModeBtn: null
};

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", initSettingsPage);

function initSettingsPage() {
  requireAuth();
  cacheElements();
  bindEvents();
  initializeState();
  loadCurrentStudentUI();
  loadFrontendSettings();
}

// ============================
// SETUP
// ============================
function cacheElements() {
  elements.form = $("#settings-form");
  elements.message = $("#settings-message");
  elements.pageTitle = $("#settings-title");
  elements.themePreviewText = $("#theme-preview-text");
  elements.themeInput = $("#themePreference");
  elements.lightModeBtn = $("#lightModeBtn");
  elements.darkModeBtn = $("#darkModeBtn");
}

function bindEvents() {
  if (elements.form) {
    on(elements.form, "submit", handleSettingsSubmit);
  }

  if (elements.lightModeBtn) {
    on(elements.lightModeBtn, "click", () => handleThemeSelection("light"));
  }

  if (elements.darkModeBtn) {
    on(elements.darkModeBtn, "click", () => handleThemeSelection("dark"));
  }
}

function initializeState() {
  state.currentStudentId = null;
  state.currentStudent = null;
}

// ============================
// LOAD FRONTEND SETTINGS
// ============================
function loadFrontendSettings() {
  clearMessage(elements.message);

  const savedTheme = localStorage.getItem("themePreference") || "light";
  state.selectedTheme = savedTheme;

  if (elements.themeInput) {
    elements.themeInput.value = savedTheme;
  }

  updateThemeButtons(savedTheme);
  updateThemePreview(savedTheme);
  applyThemePreference(savedTheme);

  if (elements.pageTitle) {
    setText(elements.pageTitle, "Settings");
  }
}

// ============================
// THEME SELECTION
// ============================
function handleThemeSelection(theme) {
  state.selectedTheme = theme;

  if (elements.themeInput) {
    elements.themeInput.value = theme;
  }

  updateThemeButtons(theme);
  updateThemePreview(theme);
  applyThemePreference(theme);
}

function updateThemeButtons(theme) {
  if (elements.lightModeBtn) {
    elements.lightModeBtn.classList.toggle("active", theme === "light");
  }

  if (elements.darkModeBtn) {
    elements.darkModeBtn.classList.toggle("active", theme === "dark");
  }
}

function updateThemePreview(themePreference) {
  if (!elements.themePreviewText) return;

  if (!themePreference) {
    setText(elements.themePreviewText, "No theme selected.");
    return;
  }

  setText(elements.themePreviewText, `Selected theme: ${themePreference}`);
}

function applyThemePreference(themePreference) {
  document.body.dataset.theme = themePreference || "light";
}

// ============================
// SAVE SETTINGS
// ============================
function handleSettingsSubmit(event) {
  event.preventDefault();
  clearMessage(elements.message);

  try {
    const rawData = getFormData(elements.form);

    const settingsData = {
      themePreference: rawData.themePreference || "light"
    };

    validateSettingsData(settingsData);

    localStorage.setItem("themePreference", settingsData.themePreference);

    state.currentStudent = {
      ...state.currentStudent,
      ...settingsData
    };

    applyThemePreference(settingsData.themePreference);
    updateThemePreview(settingsData.themePreference);
    updateThemeButtons(settingsData.themePreference);

    showMessage(elements.message, "Theme settings saved successfully.", "success");
  } catch (error) {
    console.error("Failed to save settings:", error);
    showMessage(elements.message, error.message || "Could not save settings.", "error");
  }
}

// ============================
// VALIDATION
// ============================
function validateSettingsData(data) {
  const allowedThemes = ["light", "dark"];

  if (!allowedThemes.includes(data.themePreference)) {
    throw new Error("Invalid theme preference.");
  }
}
