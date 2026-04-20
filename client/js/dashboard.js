import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import { $ } from "./utils.js";
import {
  pantryAPI,
  pantryItemAPI,
  recipeAPI,
  recipeIngredientAPI,
  storeAPI,
  purchaseAPI
} from "./api.js";

const state = {
  currentStudentId: null,
  currentStudent: null,
  pantry: null,
  pantryItems: [],
  recipes: [],
  recipeIngredients: [],
  stores: [],
  purchases: []
};

const elements = {
  advancedList: null,
  advancedEmpty: null,
  maxTimeInput: null,
  maxCostInput: null,
  findBtn: null,

  budgetValue: null,
  pantryCount: null,
  recipeCount: null,
  storeCount: null,
  spentValue: null,
  remainingValue: null,
  remainingBudgetHero: null,
  expiringCountHero: null,
  budgetProgress: null,

  recentPurchasesList: null,
  pantryAlertsList: null,
  recommendedMealsList: null
};

document.addEventListener("DOMContentLoaded", initDashboardPage);

async function initDashboardPage() {
  requireAuth();
  cacheElements();
  initializeState();
  loadCurrentStudentUI();
  await loadDashboardData();
  renderDashboard();
  bindEvents();
}

function cacheElements() {
  elements.advancedList = $("#dashboard-advanced-results-list");
  elements.advancedEmpty = $("#dashboard-advanced-empty");
  elements.maxTimeInput = $("#advanced-max-time");
  elements.maxCostInput = $("#advanced-max-budget");
  elements.findBtn = $("#advanced-apply-btn");

  elements.budgetValue = $("#dashboard-budget-value");
  elements.pantryCount = $("#dashboard-pantry-count");
  elements.recipeCount = $("#dashboard-recipe-count");
  elements.storeCount = $("#dashboard-store-count");
  elements.spentValue = $("#dashboard-spent-value");
  elements.remainingValue = $("#dashboard-remaining-value");
  elements.remainingBudgetHero = $("#dashboard-remaining-budget");
  elements.expiringCountHero = $("#dashboard-expiring-count");
  elements.budgetProgress = $("#dashboard-budget-progress");

  elements.recentPurchasesList = $("#dashboard-recent-purchases-list");
  elements.pantryAlertsList = $("#dashboard-pantry-alerts-list");
  elements.recommendedMealsList = $("#dashboard-recommended-meals-list");
}

function bindEvents() {
  if (elements.findBtn) {
    elements.findBtn.addEventListener("click", handleAdvancedSearch);
  }
}

function initializeState() {
  const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
  state.currentStudentId = currentStudent?.student_id || null;
  state.currentStudent = currentStudent || null;
}

async function loadDashboardData() {
  const [
    recipes,
    recipeIngredients,
    stores,
    purchases,
    pantry
  ] = await Promise.all([
    recipeAPI.getAll(),
    recipeIngredientAPI.getAll(),
    storeAPI.getAll(),
    purchaseAPI.getAll(),
    state.currentStudentId
      ? pantryAPI.getByStudentId(state.currentStudentId)
      : Promise.resolve(null)
  ]);

  state.recipes = Array.isArray(recipes) ? recipes : [];
  state.recipeIngredients = Array.isArray(recipeIngredients) ? recipeIngredients : [];
  state.stores = Array.isArray(stores) ? stores : [];
  state.purchases = Array.isArray(purchases) ? purchases : [];
  state.pantry = pantry || null;

  if (state.currentStudentId) {
    const items = await pantryItemAPI.getByStudentId(state.currentStudentId);
    state.pantryItems = Array.isArray(items) ? items : [];
  } else {
    state.pantryItems = [];
  }
}

function renderDashboard() {
  renderBudgetSummary();
  renderCounts();
  renderRecentPurchases();
  renderPantryAlerts();
  renderRecommendedMeals();
}

function renderBudgetSummary() {
  const weeklyBudget = Number(state.currentStudent?.budget_per_week || 0);

  const studentPurchases = state.purchases.filter(
    (p) => String(p.student_id) === String(state.currentStudentId)
  );

  const spent = studentPurchases.reduce((sum, p) => {
    return sum + Number(p.price || 0);
  }, 0);

  const remaining = Math.max(weeklyBudget - spent, 0);
  const percentUsed = weeklyBudget > 0 ? Math.min((spent / weeklyBudget) * 100, 100) : 0;

  if (elements.budgetValue) elements.budgetValue.textContent = `$${weeklyBudget.toFixed(2)}`;
  if (elements.spentValue) elements.spentValue.textContent = `$${spent.toFixed(2)}`;
  if (elements.remainingValue) elements.remainingValue.textContent = `$${remaining.toFixed(2)}`;
  if (elements.remainingBudgetHero) elements.remainingBudgetHero.textContent = `$${remaining.toFixed(2)}`;

  if (elements.budgetProgress) {
    elements.budgetProgress.style.width = `${percentUsed}%`;
  }
}

function renderCounts() {
  if (elements.pantryCount) {
    elements.pantryCount.textContent = String(state.pantryItems.length);
  }

  if (elements.recipeCount) {
    elements.recipeCount.textContent = String(state.recipes.length);
  }

  if (elements.storeCount) {
    elements.storeCount.textContent = String(state.stores.length);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  const expiringItems = state.pantryItems.filter((item) => {
    const rawDate = String(item.expiration_date).slice(0, 10);
    const [year, month, day] = rawDate.split("-").map(Number);

    const exp = new Date(year, month - 1, day);
    exp.setHours(0, 0, 0, 0);

    return exp <= threeDaysLater;
  });

  if (elements.expiringCountHero) {
    elements.expiringCountHero.textContent = `${expiringItems.length} Items`;
  }
}

function renderRecentPurchases() {
  if (!elements.recentPurchasesList) return;

  const studentPurchases = state.purchases
    .filter((p) => String(p.student_id) === String(state.currentStudentId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (!studentPurchases.length) {
    elements.recentPurchasesList.innerHTML = `
      <div class="activity-item">
        <div class="activity-info">
          <h4>No purchases yet</h4>
          <p>Add a purchase to start tracking your spending.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.recentPurchasesList.innerHTML = studentPurchases.map((p) => `
    <div class="activity-item">
      <div class="activity-info">
        <h4>${p.ingredient_name || `Ingredient ID: ${p.ingredient_id}`}</h4>
        <p>${p.quantity} ${p.unit} • ${p.date}</p>
      </div>
      <strong>$${Number(p.price).toFixed(2)}</strong>
    </div>
  `).join("");
}

function renderPantryAlerts() {
  if (!elements.pantryAlertsList) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  const alerts = state.pantryItems
    .filter((item) => {
      const rawDate = String(item.expiration_date).slice(0, 10);
      const [year, month, day] = rawDate.split("-").map(Number);

      const exp = new Date(year, month - 1, day);
      exp.setHours(0, 0, 0, 0);

      return exp <= threeDaysLater;
    })
    .sort((a, b) => {
      const dateA = String(a.expiration_date).slice(0, 10);
      const dateB = String(b.expiration_date).slice(0, 10);
      return dateA.localeCompare(dateB);
    })
    .slice(0, 5);

  if (!alerts.length) {
    elements.pantryAlertsList.innerHTML = `
      <div class="activity-item">
        <div class="activity-info">
          <h4>No pantry alerts</h4>
          <p>No items are close to expiration.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.pantryAlertsList.innerHTML = alerts.map((item) => {
    const rawDate = String(item.expiration_date).slice(0, 10);
    const [year, month, day] = rawDate.split("-").map(Number);

    const exp = new Date(year, month - 1, day);
    exp.setHours(0, 0, 0, 0);

    const status = exp < today ? "Expired" : "Expiring Soon";

    return `
      <div class="activity-item">
        <div class="activity-info">
          <h4>${item.ingredient_name || `Ingredient ID: ${item.ingredient_id}`}</h4>
          <p>${status} • ${rawDate}</p>
        </div>
        <strong>${item.quantity} ${item.unit}</strong>
      </div>
    `;
  }).join("");
}

function renderRecommendedMeals() {
  if (!elements.recommendedMealsList) return;

  const pantryIds = new Set(state.pantryItems.map((item) => String(item.ingredient_id)));

  const scoredRecipes = state.recipes.map((recipe) => {
    const recipeId = String(recipe.recipe_id);
    const ingredients = state.recipeIngredients.filter(
      (ri) => String(ri.recipe_id) === recipeId
    );

    const total = ingredients.length || 1;
    const matched = ingredients.filter((ri) => pantryIds.has(String(ri.ingredient_id))).length;

    return {
      ...recipe,
      pantryMatch: matched / total
    };
  });

  const topRecipes = scoredRecipes
    .sort((a, b) => b.pantryMatch - a.pantryMatch)
    .slice(0, 5);

  if (!topRecipes.length) {
    elements.recommendedMealsList.innerHTML = `
      <div class="meal-item">
        <div class="meal-info">
          <h4>No recommended meals yet</h4>
          <p>Add recipes and pantry items to see suggestions.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.recommendedMealsList.innerHTML = topRecipes.map((recipe) => `
    <div class="meal-item">
      <div class="meal-info">
        <h4>${recipe.name}</h4>
        <p>${recipe.type} • ${recipe.total_time_prep} min</p>
      </div>
      <strong>${Math.round(recipe.pantryMatch * 100)}%</strong>
    </div>
  `).join("");
}

async function handleAdvancedSearch() {
  try {
    const maxTime = elements.maxTimeInput.value || 9999;
    const maxCost = elements.maxCostInput.value || 9999;
    const studentId = state.currentStudentId;

    const response = await fetch(
      `http://localhost:3000/api/advanced-meals?student_id=${encodeURIComponent(studentId)}&max_time=${encodeURIComponent(maxTime)}&max_budget=${encodeURIComponent(maxCost)}`
    );

    const data = await response.json();
    renderAdvancedMeals(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Advanced search error:", error);
    if (elements.advancedList) {
      elements.advancedList.innerHTML = `<p>Error loading meals.</p>`;
    }
  }
}

function renderAdvancedMeals(recipes) {
  if (!elements.advancedList) return;

  if (!recipes.length) {
    elements.advancedList.innerHTML = `
      <p>No meals match your budget and time.</p>
    `;
    return;
  }

  elements.advancedList.innerHTML = recipes.map((r) => `
    <div class="meal-item">
      <div class="meal-info">
        <h4>${r.name}</h4>
        <p>
          Time: ${r.total_time_prep} min •
          Pantry Match: ${r.matched_ingredients}/${r.total_ingredients}
        </p>
        <p>
          Total Recipe Cost: $${Number(r.estimated_total_recipe_cost || 0).toFixed(2)} •
          Pantry Value Used: $${Number(r.pantry_value_used || 0).toFixed(2)} •
          Missing to Buy: $${Number(r.cost_to_buy_missing || 0).toFixed(2)}
        </p>
        <p>
          <strong>Need to buy:</strong>
          ${r.missing_ingredients ? r.missing_ingredients : "Nothing missing"}
        </p>
      </div>
      <strong>$${Number(r.cost_to_buy_missing || 0).toFixed(2)}</strong>
    </div>
  `).join("");
}