// settings.js

import {
    $,
    on,
    getFormData,
    fillForm,
    clearMessage,
    showMessage,
    setText
  } from "./utils.js";
  
  import { studentAPI } from "./api.js";
  
  // ============================
  // PAGE STATE
  // ============================
  const state = {
    currentStudentId: null,
    currentStudent: null
  };
  
  // ============================
  // DOM ELEMENTS
  // ============================
  const elements = {
    form: null,
    message: null,
    pageTitle: null,
    themePreviewText: null
  };
  
  // ============================
  // INIT
  // ============================
  document.addEventListener("DOMContentLoaded", initSettingsPage);
  
  async function initSettingsPage() {
    cacheElements();
    bindEvents();
    initializeState();
    await loadSettings();
  }
  
  function cacheElements() {
    elements.form = $("#settings-form");
    elements.message = $("#settings-message");
    elements.pageTitle = $("#settings-title");
    elements.themePreviewText = $("#theme-preview-text");
  }
  
  function bindEvents() {
    on(elements.form, "submit", handleSettingsSubmit);
  
    const themeInput = $("#themePreference");
    on(themeInput, "change", handleThemePreviewChange);
  }
  
  function initializeState() {
    /*
      Later this should come from auth/session/localStorage.
      Example:
      state.currentStudentId = localStorage.getItem("studentId");
    */
    state.currentStudentId = null;
    state.currentStudent = null;
  }
  
  // ============================
  // LOAD SETTINGS
  // ============================
  async function loadSettings() {
    clearMessage(elements.message);
  
    try {
      if (!state.currentStudentId) {
        renderSettingsUnavailable();
        return;
      }
  
      const student = await studentAPI.getById(state.currentStudentId);
  
      if (!student) {
        throw new Error("Settings could not be loaded.");
      }
  
      state.currentStudent = student;
      renderSettings(student);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showMessage(elements.message, error.message || "Unable to load settings.", "error");
    }
  }
  
  function renderSettings(student) {
    fillForm(elements.form, {
      themePreference: student.themePreference ?? ""
    });
  
    updateThemePreview(student.themePreference);
  
    if (elements.pageTitle) {
      setText(elements.pageTitle, "Settings");
    }
  }
  
  function renderSettingsUnavailable() {
    if (elements.pageTitle) {
      setText(elements.pageTitle, "Settings");
    }
  
    showMessage(
      elements.message,
      "No logged-in student found yet. Connect auth/session later to load real settings.",
      "info"
    );
  }
  
  // ============================
  // SUBMIT
  // ============================
  async function handleSettingsSubmit(event) {
    event.preventDefault();
    clearMessage(elements.message);
  
    try {
      if (!state.currentStudentId) {
        throw new Error("No logged-in student found.");
      }
  
      const rawData = getFormData(elements.form);
  
      const settingsData = {
        themePreference: rawData.themePreference ?? ""
      };
  
      validateSettingsData(settingsData);
  
      await studentAPI.update(state.currentStudentId, settingsData);
  
      state.currentStudent = {
        ...state.currentStudent,
        ...settingsData
      };
  
      applyThemePreference(settingsData.themePreference);
      updateThemePreview(settingsData.themePreference);
  
      showMessage(elements.message, "Settings updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update settings:", error);
      showMessage(elements.message, error.message || "Could not update settings.", "error");
    }
  }
  
  // ============================
  // THEME PREVIEW / APPLY
  // ============================
  function handleThemePreviewChange(event) {
    const selectedTheme = event.target.value;
    updateThemePreview(selectedTheme);
    applyThemePreference(selectedTheme);
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
    /*
      This is only frontend visual preparation.
      You can connect it to your actual CSS theme classes later.
    */
  
    document.body.dataset.theme = themePreference || "";
  }
  
  // ============================
  // VALIDATION
  // ============================
  function validateSettingsData(data) {
    if (!data.themePreference) {
      throw new Error("Theme preference is required.");
    }
  }