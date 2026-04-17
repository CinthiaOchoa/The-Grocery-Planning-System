import { recipeAPI } from "./api.js";

const form = document.getElementById("recipeForm");
const messageBox = document.getElementById("recipeMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const recipeData = {
    recipe_id: document.getElementById("recipe_id").value.trim(),
    name: document.getElementById("name").value.trim(),
    type: document.getElementById("type").value.trim(),
    servings: Number(document.getElementById("servings").value),
    total_time_prep: Number(document.getElementById("total_time_prep").value)
  };

  try {
    const result = await recipeAPI.create(recipeData);

    messageBox.innerHTML = `<p style="color: green;">Recipe created successfully.</p>`;
    form.reset();

    console.log("Created recipe:", result);
  } catch (error) {
    console.error("Create recipe error:", error);
    messageBox.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
});