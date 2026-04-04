// auth.js

import {
    $,
    on,
    getFormData,
    clearMessage,
    showMessage,
    normalizeStudentData
  } from "./utils.js";
  
  import { authAPI } from "./api.js";
  
  // ============================
  // DOM ELEMENTS
  // ============================
  const elements = {
    loginForm: null,
    signupForm: null,
    loginMessage: null,
    signupMessage: null
  };
  
  // ============================
  // INIT
  // ============================
  document.addEventListener("DOMContentLoaded", initAuthPage);
  
  function initAuthPage() {
    cacheElements();
    bindEvents();
  }
  
  function cacheElements() {
    elements.loginForm = $("#login-form");
    elements.signupForm = $("#signup-form");
    elements.loginMessage = $("#login-message");
    elements.signupMessage = $("#signup-message");
  }
  
  function bindEvents() {
    on(elements.loginForm, "submit", handleLoginSubmit);
    on(elements.signupForm, "submit", handleSignupSubmit);
  }
  
  // ============================
  // LOGIN
  // ============================
  async function handleLoginSubmit(event) {
    event.preventDefault();
    clearMessage(elements.loginMessage);
  
    try {
      const rawData = getFormData(elements.loginForm);
      const loginData = {
        email: rawData.email ?? "",
        password: rawData.password ?? ""
      };
  
      validateLoginData(loginData);
  
      const response = await authAPI.login(loginData);
  
      /*
        Later, when backend exists, this is where you can:
        - save token
        - save current student info
        - redirect to dashboard
      */
  
      console.log("Login response:", response);
      showMessage(elements.loginMessage, "Login successful.", "success");
  
      // Later example:
      // window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Login failed:", error);
      showMessage(elements.loginMessage, error.message || "Login failed.", "error");
    }
  }
  
  // ============================
  // SIGNUP
  // ============================
  async function handleSignupSubmit(event) {
    event.preventDefault();
    clearMessage(elements.signupMessage);
  
    try {
      const rawData = getFormData(elements.signupForm);
  
      const signupData = normalizeStudentData({
        name: rawData.name,
        email: rawData.email,
        password: rawData.password,
        budgetPerWeek: rawData.budgetPerWeek,
        zipCode: rawData.zipCode,
        profilePictureUrl: rawData.profilePictureUrl,
        themePreference: rawData.themePreference
      });
  
      const confirmPassword = rawData.confirmPassword ?? "";
  
      validateSignupData(signupData, confirmPassword);
  
      const response = await authAPI.signup(signupData);
  
      /*
        Later, when backend exists, this is where you can:
        - redirect to login
        - or auto-login and redirect to dashboard
      */
  
      console.log("Signup response:", response);
      showMessage(elements.signupMessage, "Signup successful.", "success");
  
      // Later example:
      // window.location.href = "login.html";
    } catch (error) {
      console.error("Signup failed:", error);
      showMessage(elements.signupMessage, error.message || "Signup failed.", "error");
    }
  }
  
  // ============================
  // VALIDATION
  // ============================
  function validateLoginData(data) {
    if (!data.email) {
      throw new Error("Email is required.");
    }
  
    if (!data.password) {
      throw new Error("Password is required.");
    }
  }
  
  function validateSignupData(data, confirmPassword) {
    if (!data.name) {
      throw new Error("Name is required.");
    }
  
    if (!data.email) {
      throw new Error("Email is required.");
    }
  
    if (!data.password) {
      throw new Error("Password is required.");
    }
  
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
  
    if (!confirmPassword) {
      throw new Error("Please confirm your password.");
    }
  
    if (data.password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
  
    if (data.budgetPerWeek != null && Number.isNaN(data.budgetPerWeek)) {
      throw new Error("Budget per week must be a valid number.");
    }
  }