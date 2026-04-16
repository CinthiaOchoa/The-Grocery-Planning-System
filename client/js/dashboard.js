// dashboard.js
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import {
    $,
    clearMessage,
    showMessage,
    setText,
    renderEmptyState,
    renderTableBody,
    createRow
  } from "./utils.js";
  
  import {
    studentAPI,
    pantryAPI,
    pantryItemAPI,
    ingredientAPI,
    recipeAPI,
    storeAPI,
    purchaseAPI
  } from "./api.js";
  
  // ============================
  // PAGE STATE
  // ============================
  const state = {
    currentStudentId: null,
    currentStudent: null,
    pantry: null,
    pantryItems: [],
    ingredients: [],
    recipes: [],
    stores: [],
    purchases: []
  };
  
  // ============================
  // DOM ELEMENTS
  // ============================
  const elements = {
    message: null,
    welcomeText: null,
    budgetValue: null,
    pantryCountValue: null,
    ingredientCountValue: null,
    recipeCountValue: null,
    storeCountValue: null,
    purchaseCountValue: null,
    recentPurchasesTableBody: null
  };
  
  // ============================
  // INIT
  // ============================
  document.addEventListener("DOMContentLoaded", initDashboardPage);
  
  async function initDashboardPage() {
    requireAuth();
    cacheElements();
    initializeState();
    loadCurrentStudentUI();
    await loadDashboardData();
  }
  
  function cacheElements() {
    elements.message = $("#dashboard-message");
    elements.welcomeText = $("#dashboard-welcome-text");
    elements.budgetValue = $("#dashboard-budget-value");
    elements.pantryCountValue = $("#dashboard-pantry-count");
    elements.ingredientCountValue = $("#dashboard-ingredient-count");
    elements.recipeCountValue = $("#dashboard-recipe-count");
    elements.storeCountValue = $("#dashboard-store-count");
    elements.purchaseCountValue = $("#dashboard-purchase-count");
    elements.recentPurchasesTableBody = $("#dashboard-recent-purchases-body");
  }
  
  function initializeState() {
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
  
    state.currentStudentId = currentStudent?.student_id || null;
    state.currentStudent = currentStudent || null;
    state.pantry = null;
    state.pantryItems = [];
    state.ingredients = [];
    state.recipes = [];
    state.stores = [];
    state.purchases = [];
  }
  
  // ============================
  // LOAD DASHBOARD DATA
  // ============================
  async function loadDashboardData() {
    clearMessage(elements.message);
  
    try {
      await loadCurrentStudent();
      await loadSummaryData();
      renderDashboard();
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      renderDashboard();
      showMessage(elements.message, error.message || "Unable to load dashboard.", "error");
    }
  }
  
  async function loadCurrentStudent() {
    if (!state.currentStudentId) {
      return;
    }
  
    const student = await studentAPI.getById(state.currentStudentId);
    state.currentStudent = student || null;
  }
  
  async function loadSummaryData() {
    const requests = [
      ingredientAPI.getAll(),
      recipeAPI.getAll(),
      storeAPI.getAll(),
      purchaseAPI.getAll()
    ];
  
    const pantryRequest = state.currentStudentId
      ? pantryAPI.getByStudentId(state.currentStudentId)
      : Promise.resolve(null);
  
    const [
      ingredients,
      recipes,
      stores,
      purchases,
      pantry
    ] = await Promise.all([
      ...requests,
      pantryRequest
    ]);
  
    state.ingredients = Array.isArray(ingredients) ? ingredients : [];
    state.recipes = Array.isArray(recipes) ? recipes : [];
    state.stores = Array.isArray(stores) ? stores : [];
    state.purchases = Array.isArray(purchases) ? purchases : [];
    state.pantry = pantry || null;
  
    if (state.pantry?.pantryId) {
      const pantryItems = await pantryItemAPI.getByPantryId(state.pantry.pantryId);
      state.pantryItems = Array.isArray(pantryItems) ? pantryItems : [];
    } else {
      state.pantryItems = [];
    }
  }
  
  // ============================
  // RENDER DASHBOARD
  // ============================
  function renderDashboard() {
    renderWelcomeText();
    renderSummaryCards();
    renderRecentPurchases();
  }
  
  function renderWelcomeText() {
    if (!elements.welcomeText) return;
  
    if (state.currentStudent?.name) {
      setText(elements.welcomeText, `Welcome, ${state.currentStudent.name}`);
      return;
    }
  
    setText(elements.welcomeText, "Welcome");
  }
  
  function renderSummaryCards() {
    setText(elements.budgetValue, formatBudget(state.currentStudent?.budget_per_week));
    setText(elements.pantryCountValue, String(state.pantryItems.length));
    setText(elements.ingredientCountValue, String(state.ingredients.length));
    setText(elements.recipeCountValue, String(state.recipes.length));
    setText(elements.storeCountValue, String(state.stores.length));
    setText(elements.purchaseCountValue, String(state.purchases.length));
  }
  
  function renderRecentPurchases() {
    if (!elements.recentPurchasesTableBody) return;
  
    if (!state.purchases.length) {
      renderEmptyState(elements.recentPurchasesTableBody, "No purchases available.", 4);
      return;
    }
  
    const recentPurchases = getRecentPurchases(state.purchases, 5);
    const rows = recentPurchases.map((purchase) => createRecentPurchaseRow(purchase));
    renderTableBody(elements.recentPurchasesTableBody, rows);
  }
  
  function createRecentPurchaseRow(purchase) {
    return createRow([
      purchase.purchaseId ?? "",
      purchase.date ?? "",
      purchase.quantity ?? "",
      purchase.price ?? ""
    ]);
  }
  
  // ============================
  // HELPERS
  // ============================
  function getRecentPurchases(purchases, limit = 5) {
    return [...purchases]
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }
  
  function formatBudget(value) {
    if (value == null || Number.isNaN(Number(value))) {
      return "$0.00";
    }
  
    return `$${Number(value).toFixed(2)}`;
  }