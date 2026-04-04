// profile.js

import {
    $,
    on,
    getFormData,
    fillForm,
    clearMessage,
    showMessage,
    normalizeStudentData,
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
    submitButton: null,
    profileImage: null
  };
  
  // ============================
  // INIT
  // ============================
  document.addEventListener("DOMContentLoaded", initProfilePage);
  
  async function initProfilePage() {
    cacheElements();
    bindEvents();
    initializeState();
    await loadProfile();
  }
  
  function cacheElements() {
    elements.form = $("#profile-form");
    elements.message = $("#profile-message");
    elements.pageTitle = $("#profile-title");
    elements.submitButton = $("#profile-submit-btn");
    elements.profileImage = $("#profile-preview-image");
  }
  
  function bindEvents() {
    on(elements.form, "submit", handleProfileSubmit);
  
    const profilePictureInput = $("#profilePictureUrl");
    on(profilePictureInput, "input", handleProfileImagePreview);
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
  // LOAD PROFILE
  // ============================
  async function loadProfile() {
    clearMessage(elements.message);
  
    try {
      if (!state.currentStudentId) {
        renderProfileUnavailable();
        return;
      }
  
      const student = await studentAPI.getById(state.currentStudentId);
  
      if (!student) {
        throw new Error("Profile not found.");
      }
  
      state.currentStudent = student;
      renderProfile(student);
    } catch (error) {
      console.error("Failed to load profile:", error);
      showMessage(elements.message, error.message || "Unable to load profile.", "error");
    }
  }
  
  function renderProfile(student) {
    fillForm(elements.form, {
      studentId: student.studentId ?? "",
      name: student.name ?? "",
      email: student.email ?? "",
      budgetPerWeek: student.budgetPerWeek ?? "",
      zipCode: student.zipCode ?? "",
      profilePictureUrl: student.profilePictureUrl ?? ""
    });
  
    updateProfileImagePreview(student.profilePictureUrl);
  
    if (elements.pageTitle) {
      setText(elements.pageTitle, student.name ? `${student.name}'s Profile` : "My Profile");
    }
  }
  
  function renderProfileUnavailable() {
    if (elements.pageTitle) {
      setText(elements.pageTitle, "My Profile");
    }
  
    showMessage(
      elements.message,
      "No logged-in student found yet. Connect auth/session later to load the real profile.",
      "info"
    );
  }
  
  // ============================
  // SUBMIT
  // ============================
  async function handleProfileSubmit(event) {
    event.preventDefault();
    clearMessage(elements.message);
  
    try {
      if (!state.currentStudentId) {
        throw new Error("No logged-in student found.");
      }
  
      const rawData = getFormData(elements.form);
  
      const profileData = normalizeStudentData({
        studentId: state.currentStudentId,
        name: rawData.name,
        email: rawData.email,
        budgetPerWeek: rawData.budgetPerWeek,
        zipCode: rawData.zipCode,
        profilePictureUrl: rawData.profilePictureUrl,
        themePreference: state.currentStudent?.themePreference ?? ""
      });
  
      validateProfileData(profileData);
  
      await studentAPI.update(state.currentStudentId, profileData);
  
      state.currentStudent = {
        ...state.currentStudent,
        ...profileData
      };
  
      updateProfileImagePreview(profileData.profilePictureUrl);
      showMessage(elements.message, "Profile updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update profile:", error);
      showMessage(elements.message, error.message || "Could not update profile.", "error");
    }
  }
  
  // ============================
  // IMAGE PREVIEW
  // ============================
  function handleProfileImagePreview(event) {
    const imageUrl = event.target.value.trim();
    updateProfileImagePreview(imageUrl);
  }
  
  function updateProfileImagePreview(imageUrl) {
    if (!elements.profileImage) return;
  
    if (imageUrl) {
      elements.profileImage.src = imageUrl;
      elements.profileImage.alt = "Profile preview";
      elements.profileImage.style.display = "block";
    } else {
      elements.profileImage.removeAttribute("src");
      elements.profileImage.alt = "No profile image selected";
      elements.profileImage.style.display = "none";
    }
  }
  
  // ============================
  // VALIDATION
  // ============================
  function validateProfileData(data) {
    if (!data.name) {
      throw new Error("Name is required.");
    }
  
    if (!data.email) {
      throw new Error("Email is required.");
    }
  
    if (data.budgetPerWeek != null && Number.isNaN(data.budgetPerWeek)) {
      throw new Error("Budget per week must be a valid number.");
    }
  }