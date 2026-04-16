import { ingredientAPI } from "./api.js";
import { loadCurrentStudentUI, requireAuth } from "./currentStudent.js";

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  loadCurrentStudentUI();

  const form = document.getElementById("newIngredientForm");
  const ingredientIdInput = document.getElementById("ingredient_id");
  const tableBody = document.getElementById("ingredientsTableBody");
  const emptyState = document.querySelector(".ingredients-empty-state");
  const searchInput = document.getElementById("ingredient-search");

  let allIngredients = [];

  if (form) {
    loadNextIngredientId();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const ingredientId = document.getElementById("ingredient_id")?.value.trim();
      const name = document.getElementById("name")?.value.trim();
      const category = document.getElementById("category")?.value.trim();
      const protein = document.getElementById("protein")?.value.trim();
      const calories = document.getElementById("calories")?.value.trim();
      const nutritionScore = document.getElementById("nutrition_score")?.value.trim();

      if (!ingredientId || !name || !category || !protein || !calories || !nutritionScore) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        await ingredientAPI.create({
          ingredient_id: ingredientId,
          name,
          category,
          protein: parseFloat(protein),
          calories: parseInt(calories, 10),
          nutrition_score: parseFloat(nutritionScore)
        });

        alert("Ingredient saved successfully.");
        window.location.href = "ingredients-dataset.html";
      } catch (error) {
        console.error(error);
        alert(error.message || "Could not save ingredient.");
      }
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        loadNextIngredientId();
        if (ingredientIdInput) ingredientIdInput.focus();
      }, 0);
    });
  }

  if (tableBody) {
    loadIngredientsTable();
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderIngredientsTable);
  }

  async function loadIngredientsTable() {
    try {
      allIngredients = await ingredientAPI.getAll();
      renderIngredientsTable();
    } catch (error) {
      console.error("Failed to load ingredients:", error);
      if (emptyState) {
        emptyState.style.display = "flex";
      }
    }
  }

  function renderIngredientsTable() {
    if (!tableBody) return;

    const searchValue = searchInput?.value?.trim().toLowerCase() || "";

    let filteredIngredients = [...allIngredients];

    if (searchValue) {
      filteredIngredients = filteredIngredients.filter((ingredient) =>
        String(ingredient.ingredient_id ?? "").toLowerCase().includes(searchValue) ||
        String(ingredient.name ?? "").toLowerCase().includes(searchValue) ||
        String(ingredient.category ?? "").toLowerCase().includes(searchValue)
      );
    }

    tableBody.innerHTML = "";

    if (filteredIngredients.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    tableBody.innerHTML = filteredIngredients.map(createIngredientRow).join("");
  }

  function createIngredientRow(ingredient) {
    return `
      <tr>
        <td>${ingredient.ingredient_id ?? ""}</td>
        <td>${ingredient.name ?? ""}</td>
        <td>${ingredient.category ?? ""}</td>
        <td>${ingredient.protein ?? ""}</td>
        <td>${ingredient.calories ?? ""}</td>
        <td>${ingredient.nutrition_score ?? ""}</td>
        <td>
          <button
            class="btn-link-action edit-ingredient-btn"
            data-ingredient-id="${ingredient.ingredient_id}"
            data-name="${ingredient.name ?? ""}"
            data-category="${ingredient.category ?? ""}"
            data-protein="${ingredient.protein ?? ""}"
            data-calories="${ingredient.calories ?? ""}"
            data-nutrition-score="${ingredient.nutrition_score ?? ""}"
          >
            Edit Ingredient
          </button>
        </td>
      </tr>
    `;
  }

  async function loadNextIngredientId() {
    if (!ingredientIdInput) return;

    try {
      const ingredients = await ingredientAPI.getAll();
      const nextId = getNextIngredientId(ingredients);

      ingredientIdInput.value = String(nextId);
      ingredientIdInput.placeholder = `Next ID: ${nextId}`;
    } catch (error) {
      console.error("Could not load next ingredient ID:", error);
      ingredientIdInput.value = "";
      ingredientIdInput.placeholder = "Could not load ID";
    }
  }

  function getNextIngredientId(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return 1;
    }

    let maxId = 0;

    ingredients.forEach((ingredient) => {
      const rawId = ingredient.ingredient_id ?? ingredient.ingredientId ?? 0;
      const numericId = Number(rawId);

      if (!Number.isNaN(numericId) && numericId > maxId) {
        maxId = numericId;
      }
    });

    return maxId + 1;
  }

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const button = event.target.closest(".edit-ingredient-btn");
      if (!button) return;

      const ingredientId = button.dataset.ingredientId;

      const newName = prompt("Edit name:", button.dataset.name);
      if (newName === null) return;

      const newCategory = prompt("Edit category:", button.dataset.category);
      if (newCategory === null) return;

      const newProtein = prompt("Edit protein:", button.dataset.protein);
      if (newProtein === null) return;

      const newCalories = prompt("Edit calories:", button.dataset.calories);
      if (newCalories === null) return;

      const newNutritionScore = prompt("Edit nutrition score:", button.dataset.nutritionScore);
      if (newNutritionScore === null) return;

      try {
        await ingredientAPI.update(ingredientId, {
          name: newName,
          category: newCategory,
          protein: parseFloat(newProtein),
          calories: parseInt(newCalories, 10),
          nutrition_score: parseFloat(newNutritionScore)
        });

        await loadIngredientsTable();
        alert("Ingredient updated successfully.");
      } catch (error) {
        console.error(error);
        alert(error.message || "Could not update ingredient.");
      }
    });
  }
});