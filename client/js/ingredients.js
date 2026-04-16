// ingredients.js
import { loadCurrentStudentUI } from "./currentStudent.js";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newIngredientForm");
  const tableBody = document.getElementById("ingredientsTableBody");
  const emptyState = document.querySelector(".ingredients-empty-state");

  function getIngredients() {
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  }

  function saveIngredients(ingredients) {
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
  }

  // =========================
  // NEW INGREDIENT PAGE
  // =========================
  if (form) {
    form.addEventListener("submit", (e) => {
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

      const ingredients = getIngredients();

      const alreadyExists = ingredients.some(
        (ingredient) => String(ingredient.ingredient_id) === String(ingredientId)
      );

      if (alreadyExists) {
        alert("Ingredient ID already exists. Please use a different ID.");
        return;
      }

      const newIngredient = {
        ingredient_id: ingredientId,
        name: name,
        category: category,
        protein: parseFloat(protein),
        calories: parseInt(calories, 10),
        nutrition_score: parseFloat(nutritionScore)
      };

      ingredients.push(newIngredient);
      saveIngredients(ingredients);

      alert("Ingredient saved successfully.");
      window.location.href = "ingredients-dataset.html";
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        const firstField = document.getElementById("ingredient_id");
        if (firstField) firstField.focus();
      }, 0);
    });
  }

  // =========================
  // INGREDIENTS DATASET PAGE
  // =========================
  if (tableBody) {
    const ingredients = getIngredients();
    tableBody.innerHTML = "";

    ingredients.forEach((ingredient) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${ingredient.ingredient_id ?? ""}</td>
        <td>${ingredient.name ?? ""}</td>
        <td>${ingredient.category ?? ""}</td>
        <td>${ingredient.protein ?? ""}</td>
        <td>${ingredient.calories ?? ""}</td>
        <td>${ingredient.nutrition_score ?? ""}</td>
      `;

      tableBody.appendChild(row);
    });

    if (emptyState) {
      emptyState.style.display = ingredients.length > 0 ? "none" : "flex";
    }
  }
});