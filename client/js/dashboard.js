import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";
import { $ } from "./utils.js";
import {
  studentAPI,
  pantryAPI,
  pantryItemAPI,
  ingredientAPI,
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
  ingredients: [],
  recipes: [],
  recipeIngredients: [],
  stores: [],
  purchases: []
};

const elements = {
  budgetValue: null,
  pantryCountValue: null,
  recipeCountValue: null,
  storeCountValue: null,
  remainingBudgetHero: null,
  expiringCountHero: null,
  spentValue: null,
  remainingValue: null,
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
}

function cacheElements() {
  elements.budgetValue = $("#dashboard-budget-value");
  elements.pantryCountValue = $("#dashboard-pantry-count");
  elements.recipeCountValue = $("#dashboard-recipe-count");
  elements.storeCountValue = $("#dashboard-store-count");
  elements.remainingBudgetHero = $("#dashboard-remaining-budget");
  elements.expiringCountHero = $("#dashboard-expiring-count");
  elements.spentValue = $("#dashboard-spent-value");
  elements.remainingValue = $("#dashboard-remaining-value");
  elements.budgetProgress = $("#dashboard-budget-progress");
  elements.recentPurchasesList = $("#dashboard-recent-purchases-list");
  elements.pantryAlertsList = $("#dashboard-pantry-alerts-list");
  elements.recommendedMealsList = $("#dashboard-recommended-meals-list");
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

async function loadDashboardData() {
  try {
    if (state.currentStudentId) {
      const student = await studentAPI.getById(state.currentStudentId);
      state.currentStudent = student || state.currentStudent;
    }

    const [
      ingredients,
      recipes,
      recipeIngredients,
      stores,
      purchases,
      pantry
    ] = await Promise.all([
      ingredientAPI.getAll(),
      recipeAPI.getAll(),
      recipeIngredientAPI.getAll(),
      storeAPI.getAll(),
      purchaseAPI.getAll(),
      state.currentStudentId ? pantryAPI.getByStudentId(state.currentStudentId) : Promise.resolve(null)
    ]);
    
    state.ingredients = Array.isArray(ingredients) ? ingredients : [];
    state.recipes = Array.isArray(recipes) ? recipes : [];
    state.recipeIngredients = Array.isArray(recipeIngredients) ? recipeIngredients : [];
    state.stores = Array.isArray(stores) ? stores : [];
    state.purchases = Array.isArray(purchases) ? purchases : [];
    state.pantry = pantry || null;

    const pantryId =
      state.pantry?.pantry_id ??
      state.pantry?.pantryId ??
      null;

    if (pantryId) {
      const pantryItems = await pantryItemAPI.getByPantryId(pantryId);
      state.pantryItems = Array.isArray(pantryItems) ? pantryItems : [];
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
}

function renderDashboard() {
  renderSummaryCards();
  renderBudgetSummary();
  renderRecentPurchases();
  renderPantryAlerts();
  function renderRecommendedMeals() {
    if (!elements.recommendedMealsList) return;
  
    const pantryIngredientIds = new Set(
      state.pantryItems.map((item) =>
        String(item.ingredient_id ?? item.ingredientId ?? "")
      )
    );
  
    if (!state.recipes.length) {
      elements.recommendedMealsList.innerHTML = `
        <div class="meal-item">
          <div class="meal-info">
            <h4>No recipes available</h4>
            <p>Add recipes to the database to see recommendations here.</p>
          </div>
          <span class="tag sand">--</span>
        </div>
      `;
      return;
    }
  
    const rankedRecipes = state.recipes
      .map((recipe) => {
        const recipeId = String(recipe.recipe_id ?? recipe.recipeId ?? "");
  
        const relatedIngredients = state.recipeIngredients.filter((ri) => {
          const riRecipeId = String(ri.recipe_id ?? ri.recipeId ?? "");
          return riRecipeId === recipeId;
        });
  
        const totalIngredients = relatedIngredients.length;
  
        const matchedIngredients = relatedIngredients.filter((ri) => {
          const ingredientId = String(ri.ingredient_id ?? ri.ingredientId ?? "");
          return pantryIngredientIds.has(ingredientId);
        });
  
        return {
          ...recipe,
          totalIngredients,
          matchedCount: matchedIngredients.length
        };
      })
      .filter((recipe) => recipe.totalIngredients > 0)
      .sort((a, b) => {
        if (b.matchedCount !== a.matchedCount) {
          return b.matchedCount - a.matchedCount;
        }
        return a.totalIngredients - b.totalIngredients;
      })
      .slice(0, 3);
  
    if (!rankedRecipes.length) {
      elements.recommendedMealsList.innerHTML = `
        <div class="meal-item">
          <div class="meal-info">
            <h4>No recipe matches yet</h4>
            <p>Add pantry items and recipe ingredients to see better recommendations.</p>
          </div>
          <span class="tag sand">0%</span>
        </div>
      `;
      return;
    }
  
    elements.recommendedMealsList.innerHTML = rankedRecipes.map((recipe) => {
      const recipeId = recipe.recipe_id ?? recipe.recipeId ?? "";
      const recipeName = recipe.name ?? recipe.recipe_name ?? "Unnamed Recipe";
      const recipeDescription =
        recipe.description ??
        recipe.notes ??
        "Recipe available in your recipe list.";
  
      const totalTime =
        recipe.total_time_prep ??
        recipe.totalTimePrep ??
        recipe.total_time ??
        recipe.time_minutes ??
        "--";
  
      const matchPercent =
        recipe.totalIngredients > 0
          ? Math.round((recipe.matchedCount / recipe.totalIngredients) * 100)
          : 0;
  
      return `
        <div class="meal-item">
          <div class="meal-info">
            <h4>
              <a href="view-recipe.html?recipe_id=${encodeURIComponent(recipeId)}">
                ${escapeHtml(recipeName)}
              </a>
            </h4>
            <p>
              ${escapeHtml(recipeDescription)}
              · Match: ${recipe.matchedCount}/${recipe.totalIngredients} ingredients
            </p>
          </div>
          <span class="tag teal">${matchPercent}%</span>
        </div>
      `;
    }).join("");
  }
}

function renderSummaryCards() {
  setText(elements.budgetValue, formatCurrency(state.currentStudent?.budget_per_week));
  setText(elements.pantryCountValue, String(state.pantryItems.length));
  setText(elements.recipeCountValue, String(state.recipes.length));
  setText(elements.storeCountValue, String(state.stores.length));
}

function renderBudgetSummary() {
  const weeklyBudget = Number(state.currentStudent?.budget_per_week || 0);

  const studentPurchases = state.purchases.filter((purchase) => {
    const purchaseStudentId = purchase.student_id ?? purchase.studentId;
    return String(purchaseStudentId) === String(state.currentStudentId);
  });

  const spent = studentPurchases.reduce((sum, purchase) => {
    return sum + Number(purchase.price || 0);
  }, 0);

  const remaining = Math.max(weeklyBudget - spent, 0);
  const percentUsed = weeklyBudget > 0 ? Math.min((spent / weeklyBudget) * 100, 100) : 0;

  setText(elements.spentValue, formatCurrency(spent));
  setText(elements.remainingValue, formatCurrency(remaining));
  setText(elements.remainingBudgetHero, formatCurrency(remaining));

  if (elements.budgetProgress) {
    elements.budgetProgress.style.width = `${percentUsed}%`;
  }
}

function renderRecentPurchases() {
  if (!elements.recentPurchasesList) return;

  const studentPurchases = state.purchases
    .filter((purchase) => {
      const purchaseStudentId = purchase.student_id ?? purchase.studentId;
      return String(purchaseStudentId) === String(state.currentStudentId);
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 3);

  if (!studentPurchases.length) {
    elements.recentPurchasesList.innerHTML = `
      <div class="activity-item">
        <div class="activity-info">
          <h4>No purchases yet</h4>
          <p>Add a purchase to see your recent spending here.</p>
        </div>
        <span class="tag sand">Empty</span>
      </div>
    `;
    return;
  }

  elements.recentPurchasesList.innerHTML = studentPurchases.map((purchase) => {
    const ingredientName = getIngredientName(purchase.ingredient_id ?? purchase.ingredientId);
    const storeName = getStoreName(purchase.store_id ?? purchase.storeId);

    return `
      <div class="activity-item">
        <div class="activity-info">
          <h4>Purchased ${escapeHtml(ingredientName)}</h4>
          <p>
            Added from ${escapeHtml(storeName)} ·
            ${escapeHtml(String(purchase.quantity ?? ""))} ${escapeHtml(String(purchase.unit ?? ""))} ·
            ${escapeHtml(formatDate(purchase.date))}
          </p>
        </div>
        <span class="tag sand">${formatCurrency(purchase.price)}</span>
      </div>
    `;
  }).join("");
}

function renderPantryAlerts() {
  if (!elements.pantryAlertsList) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alertItems = state.pantryItems
    .map((item) => {
      const expiration = new Date(item.expiration_date || item.expirationDate || "");
      expiration.setHours(0, 0, 0, 0);

      const diffMs = expiration - today;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        ...item,
        diffDays
      };
    })
    .filter((item) => !Number.isNaN(item.diffDays) && item.diffDays <= 7)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 3);

  setText(elements.expiringCountHero, `${alertItems.length} Items`);

  if (!alertItems.length) {
    elements.pantryAlertsList.innerHTML = `
      <div class="activity-item">
        <div class="activity-info">
          <h4>No pantry alerts</h4>
          <p>No pantry items are close to expiration.</p>
        </div>
        <span class="tag teal">Good</span>
      </div>
    `;
    return;
  }

  elements.pantryAlertsList.innerHTML = alertItems.map((item) => {
    const ingredientName = getIngredientName(item.ingredient_id ?? item.ingredientId);
    const label =
      item.diffDays <= 2 ? "Urgent" :
      item.diffDays <= 4 ? "Soon" :
      "Watch";

    return `
      <div class="activity-item">
        <div class="activity-info">
          <h4>${escapeHtml(ingredientName)} expires soon</h4>
          <p>Use within ${item.diffDays} day${item.diffDays === 1 ? "" : "s"}.</p>
        </div>
        <span class="tag ${item.diffDays <= 2 ? "red" : "sand"}">${label}</span>
      </div>
    `;
  }).join("");
}

function getIngredientName(ingredientId) {
  const found = state.ingredients.find((ingredient) => {
    const id = ingredient.ingredient_id ?? ingredient.ingredientId;
    return String(id) === String(ingredientId);
  });

  return found?.name || `Ingredient ${ingredientId ?? ""}`;
}

function getStoreName(storeId) {
  const found = state.stores.find((store) => {
    const id = store.store_id ?? store.storeId;
    return String(id) === String(storeId);
  });

  return found?.name || `Store ${storeId ?? ""}`;
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return `$${number.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
