// profile.js

import { $, on, clearMessage, showMessage, setText } from "./utils.js";
import { studentAPI } from "./api.js";

const STORAGE_KEYS = {
  currentStudent: "currentStudent",
  studentId: "studentId",
  currentStudentId: "currentStudentId"
};

const state = {
  page: document.body?.dataset?.page || "",
  currentStudentId: null,
  currentStudent: null,
  originalStudent: null,
  selectedImageDataUrl: ""
};

const elements = {
  message: null,
  title: null,
  topbarName: null,
  topbarAvatar: null,

  viewStudentId: null,
  viewName: null,
  viewEmail: null,
  viewPassword: null,
  viewBudget: null,
  viewZip: null,
  viewPictureUrl: null,
  viewTheme: null,

  form: null,
  studentIdInput: null,
  nameInput: null,
  emailInput: null,
  budgetInput: null,
  zipInput: null,
  pictureUrlInput: null,
  themeInput: null,
  passwordInput: null,
  confirmPasswordInput: null,
  clearButton: null,

  changeImageBtn: null,
  removeImageBtn: null,
  fileInput: null,

  previewImage: null,
  avatarFallback: null,
  heroNote: null,

  previewName: null,
  previewEmail: null,
  previewBudget: null,
  previewTheme: null
};

document.addEventListener("DOMContentLoaded", initProfilePage);

async function initProfilePage() {
  cacheElements();
  bindEvents();
  initializeState();
  await loadStudent();
}

function cacheElements() {
  elements.message = $("#profile-message");
  elements.title = $("#profile-title");
  elements.topbarName = $("#topbar-name");
  elements.topbarAvatar = $("#topbar-avatar");

  elements.viewStudentId = $("#view-student-id");
  elements.viewName = $("#view-name");
  elements.viewEmail = $("#view-email");
  elements.viewPassword = $("#view-password");
  elements.viewBudget = $("#view-budget");
  elements.viewZip = $("#view-zip");
  elements.viewPictureUrl = $("#view-picture-url");
  elements.viewTheme = $("#view-theme");

  elements.form = $("#profile-form");
  elements.studentIdInput = $("#student_id");
  elements.nameInput = $("#name");
  elements.emailInput = $("#email");
  elements.budgetInput = $("#budget_per_week");
  elements.zipInput = $("#zip_code");
  elements.pictureUrlInput = $("#profile_picture_url");
  elements.themeInput = $("#theme_preference");
  elements.passwordInput = $("#password");
  elements.confirmPasswordInput = $("#confirm_password");
  elements.clearButton = $("#profile-clear-btn");

  elements.changeImageBtn = $("#change-image-btn");
  elements.removeImageBtn = $("#remove-image-btn");
  elements.fileInput = $("#profile-image-file");

  elements.previewImage = $("#profile-preview-image");
  elements.avatarFallback = $("#profile-avatar-fallback");
  elements.heroNote = $("#profile-hero-note");

  elements.previewName = $("#preview-name");
  elements.previewEmail = $("#preview-email");
  elements.previewBudget = $("#preview-budget");
  elements.previewTheme = $("#preview-theme");
}

function bindEvents() {
  if (elements.form) {
    on(elements.form, "submit", handleProfileSubmit);
    on(elements.form, "reset", handleFormReset);
  }

  if (elements.nameInput) {
    on(elements.nameInput, "input", updateLivePreview);
  }

  if (elements.emailInput) {
    on(elements.emailInput, "input", updateLivePreview);
  }

  if (elements.budgetInput) {
    on(elements.budgetInput, "input", updateLivePreview);
  }

  if (elements.themeInput) {
    on(elements.themeInput, "change", updateLivePreview);
  }

  if (elements.pictureUrlInput) {
    on(elements.pictureUrlInput, "input", handlePictureUrlChange);
  }

  if (elements.changeImageBtn && elements.fileInput) {
    on(elements.changeImageBtn, "click", () => elements.fileInput.click());
    on(elements.fileInput, "change", handleImageFileChange);
  }

  if (elements.removeImageBtn) {
    on(elements.removeImageBtn, "click", removeSelectedImage);
  }

  window.addEventListener("storage", handleStorageSync);
}

function initializeState() {
  const storedStudent = getStoredStudent();
  const storedStudentId =
    localStorage.getItem(STORAGE_KEYS.studentId) ||
    localStorage.getItem(STORAGE_KEYS.currentStudentId) ||
    storedStudent.student_id ||
    storedStudent.studentId ||
    null;
  state.currentStudentId = storedStudentId || 1;
  state.currentStudent = normalizeStudent(storedStudent);
  state.originalStudent = normalizeStudent(storedStudent);
  state.selectedImageDataUrl = state.currentStudent.profile_picture_url || "";
}

async function loadStudent() {
  clearMessageIfPossible();

  try {
    let student = null;

    if (state.currentStudentId && studentAPI && typeof studentAPI.getById === "function") {
      try {
        student = await studentAPI.getById(state.currentStudentId);
      } catch (apiError) {
        console.warn("studentAPI.getById failed, using localStorage fallback.", apiError);
      }
    }

    if (!student) {
      student = state.currentStudent;
    }

    if (!student || !student.name) {
      student = createFallbackStudent();
    }

    state.currentStudent = normalizeStudent(student);
    state.originalStudent = { ...state.currentStudent };
    state.currentStudentId = state.currentStudent.student_id || state.currentStudentId;
    state.selectedImageDataUrl = state.currentStudent.profile_picture_url || "";

    persistStudentLocally(state.currentStudent);
    renderCurrentPage();
  } catch (error) {
    console.error("Failed to load profile:", error);
    showMessageIfPossible(error.message || "Unable to load profile.", "error");
  }
}

function renderCurrentPage() {
  updateSharedHeader(state.currentStudent);
  updateSharedAvatar(state.currentStudent);

  if (state.page === "profile") {
    renderProfileView(state.currentStudent);
    return;
  }

  if (state.page === "edit-profile") {
    renderEditProfileView(state.currentStudent);
  }
}

function renderProfileView(student) {
  if (elements.title) {
    setText(elements.title, student.name ? `${student.name}'s Profile` : "Profile");
  }

  setSafeText(elements.viewStudentId, student.student_id || "-");
  setSafeText(elements.viewName, student.name || "-");
  setSafeText(elements.viewEmail, student.email || "-");
  setSafeText(elements.viewPassword, student.password ? maskPassword(student.password) : "••••••••");
  setSafeText(
    elements.viewBudget,
    student.budget_per_week !== "" && student.budget_per_week != null
      ? `$${Number(student.budget_per_week).toFixed(2)}`
      : "-"
  );
  setSafeText(elements.viewZip, student.zip_code || "-");
  setSafeText(elements.viewPictureUrl, student.profile_picture_url || "-");
  setSafeText(elements.viewTheme, student.theme_preference || "-");

  updateProfileImage(student.profile_picture_url, student.name);
}

function renderEditProfileView(student) {
  if (elements.studentIdInput) elements.studentIdInput.value = student.student_id || "";
  if (elements.nameInput) elements.nameInput.value = student.name || "";
  if (elements.emailInput) elements.emailInput.value = student.email || "";
  if (elements.budgetInput) elements.budgetInput.value = student.budget_per_week ?? "";
  if (elements.zipInput) elements.zipInput.value = student.zip_code || "";
  if (elements.pictureUrlInput) elements.pictureUrlInput.value = student.profile_picture_url || "";
  if (elements.themeInput) elements.themeInput.value = student.theme_preference || "";
  if (elements.passwordInput) elements.passwordInput.value = "";
  if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = "";

  updateLivePreview();
  updateProfileImage(student.profile_picture_url, student.name);
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  clearMessageIfPossible();

  try {
    const updatedStudent = collectFormStudentData();
    validateStudent(updatedStudent);

    if (studentAPI && typeof studentAPI.update === "function" && updatedStudent.student_id) {
      try {
        await studentAPI.update(updatedStudent.student_id, updatedStudent);
      } catch (apiError) {
        console.warn("studentAPI.update failed, saving locally only.", apiError);
      }
    }

    state.currentStudent = { ...updatedStudent };
    state.originalStudent = { ...updatedStudent };
    state.currentStudentId = updatedStudent.student_id;
    state.selectedImageDataUrl = updatedStudent.profile_picture_url || "";

    persistStudentLocally(updatedStudent);
    renderCurrentPage();

    showMessageIfPossible("Profile updated successfully.", "success");

    setTimeout(() => {
      window.location.href = "profile.html";
    }, 700);
  } catch (error) {
    console.error("Failed to update profile:", error);
    showMessageIfPossible(error.message || "Could not update profile.", "error");
  }
}

function handleFormReset(event) {
  event.preventDefault();

  if (!state.originalStudent) return;

  renderEditProfileView(state.originalStudent);
  showMessageIfPossible("Form reset to the last saved profile values.", "info");
}

function handlePictureUrlChange(event) {
  const imageUrl = event.target.value.trim();
  state.selectedImageDataUrl = imageUrl;
  updateProfileImage(imageUrl, elements.nameInput?.value || state.currentStudent?.name || "");
}

function handleImageFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imageDataUrl = typeof reader.result === "string" ? reader.result : "";
    state.selectedImageDataUrl = imageDataUrl;

    if (elements.pictureUrlInput) {
      elements.pictureUrlInput.value = imageDataUrl;
    }

    updateProfileImage(imageDataUrl, elements.nameInput?.value || state.currentStudent?.name || "");
  };
  reader.readAsDataURL(file);
}

function removeSelectedImage() {
  state.selectedImageDataUrl = "";

  if (elements.pictureUrlInput) {
    elements.pictureUrlInput.value = "";
  }

  if (elements.fileInput) {
    elements.fileInput.value = "";
  }

  updateProfileImage("", elements.nameInput?.value || state.currentStudent?.name || "");
}

function updateLivePreview() {
  const name = elements.nameInput?.value?.trim() || "-";
  const email = elements.emailInput?.value?.trim() || "-";
  const budgetValue = elements.budgetInput?.value?.trim();
  const theme = elements.themeInput?.value?.trim() || "-";

  setSafeText(elements.previewName, name);
  setSafeText(elements.previewEmail, email);
  setSafeText(
    elements.previewBudget,
    budgetValue ? `$${Number(budgetValue).toFixed(2)}` : "-"
  );
  setSafeText(elements.previewTheme, theme);

  updateSharedHeader({
    ...state.currentStudent,
    name
  });
  updateSharedAvatar({
    ...state.currentStudent,
    name,
    profile_picture_url: elements.pictureUrlInput?.value?.trim() || state.selectedImageDataUrl || ""
  });
}

function updateProfileImage(imageUrl, studentName = "") {
  const hasImage = Boolean(imageUrl && imageUrl.trim());

  if (elements.previewImage) {
    if (hasImage) {
      elements.previewImage.src = imageUrl;
      elements.previewImage.style.display = "block";
    } else {
      elements.previewImage.removeAttribute("src");
      elements.previewImage.style.display = "none";
    }
  }

  if (elements.avatarFallback) {
    if (hasImage) {
      elements.avatarFallback.style.display = "none";
    } else {
      elements.avatarFallback.style.display = "flex";
      setText(elements.avatarFallback, getInitials(studentName || state.currentStudent?.name || "Student User"));
    }
  }

  if (elements.heroNote) {
    setText(
      elements.heroNote,
      hasImage
        ? "Current profile picture preview."
        : "No profile image selected yet."
    );
  }

  updateSharedAvatar({
    ...state.currentStudent,
    name: studentName || state.currentStudent?.name || "",
    profile_picture_url: imageUrl || ""
  });
}

function updateSharedHeader(student) {
  if (elements.topbarName) {
    setText(elements.topbarName, student.name || "Student User");
  }

  if (elements.title && state.page === "profile") {
    setText(elements.title, student.name ? `${student.name}'s Profile` : "Profile");
  }
}

function updateSharedAvatar(student) {
  if (!elements.topbarAvatar) return;

  if (student.profile_picture_url) {
    elements.topbarAvatar.style.backgroundImage = `url('${student.profile_picture_url}')`;
    elements.topbarAvatar.style.backgroundSize = "cover";
    elements.topbarAvatar.style.backgroundPosition = "center";
    elements.topbarAvatar.textContent = "";
  } else {
    elements.topbarAvatar.style.backgroundImage = "";
    setText(elements.topbarAvatar, getInitials(student.name || "Student User"));
  }
}

function collectFormStudentData() {
  const studentId =
    elements.studentIdInput?.value?.trim() ||
    state.currentStudentId ||
    state.currentStudent?.student_id ||
    generateFallbackStudentId();

  return {
    student_id: studentId,
    name: elements.nameInput?.value?.trim() || "",
    email: elements.emailInput?.value?.trim() || "",
    password: elements.passwordInput?.value?.trim() || state.currentStudent?.password || "",
    budget_per_week: parseBudget(elements.budgetInput?.value),
    zip_code: elements.zipInput?.value?.trim() || "",
    profile_picture_url: elements.pictureUrlInput?.value?.trim() || state.selectedImageDataUrl || "",
    theme_preference: elements.themeInput?.value?.trim() || ""
  };
}

function validateStudent(student) {
  if (!student.name) {
    throw new Error("Name is required.");
  }

  if (!student.email) {
    throw new Error("Email is required.");
  }

  if (!/^\S+@\S+\.\S+$/.test(student.email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (student.budget_per_week !== "" && Number.isNaN(student.budget_per_week)) {
    throw new Error("Budget per week must be a valid number.");
  }

  if (student.budget_per_week !== "" && Number(student.budget_per_week) < 0) {
    throw new Error("Budget per week cannot be negative.");
  }

  if (
    elements.passwordInput &&
    elements.confirmPasswordInput &&
    (elements.passwordInput.value || elements.confirmPasswordInput.value) &&
    elements.passwordInput.value !== elements.confirmPasswordInput.value
  ) {
    throw new Error("Password and confirm password must match.");
  }
}

function getStoredStudent() {
  const raw =
    localStorage.getItem(STORAGE_KEYS.currentStudent) ||
    localStorage.getItem("studentProfile") ||
    "";

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Could not parse stored student.", error);
    return {};
  }
}

function persistStudentLocally(student) {
  localStorage.setItem(STORAGE_KEYS.currentStudent, JSON.stringify(student));
  localStorage.setItem("studentProfile", JSON.stringify(student));
  localStorage.setItem(STORAGE_KEYS.studentId, student.student_id || "");
  localStorage.setItem(STORAGE_KEYS.currentStudentId, student.student_id || "");
}

function handleStorageSync() {
  const syncedStudent = normalizeStudent(getStoredStudent());
  state.currentStudent = syncedStudent;
  state.originalStudent = { ...syncedStudent };
  state.currentStudentId = syncedStudent.student_id || state.currentStudentId;
  state.selectedImageDataUrl = syncedStudent.profile_picture_url || "";
  renderCurrentPage();
}

function normalizeStudent(student = {}) {
  return {
    student_id: student.student_id ?? student.studentId ?? "",
    name: student.name ?? "",
    email: student.email ?? "",
    password: student.password ?? "",
    budget_per_week: student.budget_per_week ?? student.budgetPerWeek ?? "",
    zip_code: student.zip_code ?? student.zipCode ?? "",
    profile_picture_url: student.profile_picture_url ?? student.profilePictureUrl ?? "",
    theme_preference: student.theme_preference ?? student.themePreference ?? ""
  };
}

function createFallbackStudent() {
  return normalizeStudent({
    student_id: state.currentStudentId || "S001",
    name: "Student User",
    email: "student@example.com",
    password: "",
    budget_per_week: 50,
    zip_code: "30303",
    profile_picture_url: "",
    theme_preference: "light"
  });
}

function parseBudget(value) {
  if (value == null || value === "") return "";
  const num = Number(value);
  return Number.isNaN(num) ? NaN : num;
}

function getInitials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "SU";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function maskPassword(password) {
  if (!password) return "••••••••";
  return "•".repeat(Math.max(8, password.length));
}

function generateFallbackStudentId() {
  return state.currentStudentId || "S001";
}

function setSafeText(element, value) {
  if (!element) return;
  setText(element, String(value));
}

function clearMessageIfPossible() {
  if (elements.message && typeof clearMessage === "function") {
    clearMessage(elements.message);
  }
}

function showMessageIfPossible(text, type) {
  if (elements.message && typeof showMessage === "function") {
    showMessage(elements.message, text, type);
  }
}