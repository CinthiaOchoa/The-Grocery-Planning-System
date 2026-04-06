// api.js

const notImplemented = (action) => {
  throw new Error(`${action} is not connected to the backend yet.`);
};

// ======================
// STUDENT API
// ======================
export const studentAPI = {
  async getById(studentId) {
    return null;
  },

  async getByEmail(email) {
    return null;
  },

  async create(studentData) {
    notImplemented("Create student");
  },

  async update(studentId, updatedData) {
    notImplemented("Update student");
  },

  async updateThemePreference(studentId, themePreference) {
    notImplemented("Update student theme preference");
  },

  async updateBudget(studentId, budgetPerWeek) {
    notImplemented("Update student budget");
  },

  async delete(studentId) {
    notImplemented("Delete student");
  }
};

// ======================
// AUTH API
// ======================
export const authAPI = {
  async login({ email, password }) {
    notImplemented("Login");
  },

  async signup(studentData) {
    notImplemented("Signup");
  },

  async logout() {
    notImplemented("Logout");
  }
};

// ======================
// PANTRY API
// ======================
export const pantryAPI = {
  async getAllPantries() {
    return [];
  },

  async getPantryById(pantryId) {
    return null;
  },

  async getPantryByStudentId(studentId) {
    return null;
  },

  async createPantry(pantryData) {
    notImplemented("Create pantry");
  },

  async assignPantryToStudent({ pantryId, studentId }) {
    notImplemented("Assign pantry to student");
  },

  async updatePantry(pantryId, updatedData) {
    notImplemented("Update pantry");
  },

  async deletePantry(pantryId) {
    notImplemented("Delete pantry");
  }
};

// ======================
// INGREDIENT API
// ======================
export const ingredientAPI = {
  async getAllIngredients() {
    return [];
  },

  async getIngredientById(ingredientId) {
    return null;
  },

  async getById(ingredientId) {
    const response = await fetch(`/api/ingredients/${encodeURIComponent(ingredientId)}`);
    if (!response.ok) throw new Error("Failed to fetch ingredient.");
    return response.json();
  },

  async searchIngredients(filters = {}) {
    return [];
  },

  async createIngredient(ingredientData) {
    notImplemented("Create ingredient");
  },

  async updateIngredient(ingredientId, updatedData) {
    notImplemented("Update ingredient");
  },

  async deleteIngredient(ingredientId) {
    notImplemented("Delete ingredient");
  }
};

// ======================
// PANTRY ITEM API
// ======================
export const pantryItemAPI = {
  async getAllPantryItems() {
    return [];
  },

  async getPantryItemsByPantryId(pantryId) {
    return [];
  },

  async getPantryItemByKeys({ pantryId, ingredientId }) {
    return null;
  },

  async addPantryItem(pantryItemData) {
    notImplemented("Add pantry item");
  },

  async updatePantryItem(pantryId, ingredientId, updatedData) {
    notImplemented("Update pantry item");
  },

  async deletePantryItem(pantryId, ingredientId) {
    notImplemented("Delete pantry item");
  }
};

// ======================
// STORE API
// ======================
export const storeAPI = {
  async getAllStores() {
    return [];
  },

  async getStoreById(storeId) {
    return null;
  },

  async createStore(storeData) {
    notImplemented("Create store");
  },

  async updateStore(storeId, updatedData) {
    notImplemented("Update store");
  },

  async deleteStore(storeId) {
    notImplemented("Delete store");
  }
};

// ======================
// PURCHASED INGREDIENT API
// ======================
export const purchaseAPI = {
  async getAllPurchases() {
    return [];
  },

  async getPurchaseById(purchaseId) {
    return null;
  },

  async getPurchasesByStudentId(studentId) {
    return [];
  },

  async getPurchasesByStoreId(storeId) {
    return [];
  },

  async createPurchase(purchaseData) {
    notImplemented("Create purchased ingredient record");
  },

  async updatePurchase(purchaseId, updatedData) {
    notImplemented("Update purchased ingredient record");
  },

  async deletePurchase(purchaseId) {
    notImplemented("Delete purchased ingredient record");
  }
};

// ======================
// RECIPE API
// ======================
export const recipeAPI = {
  async getAllRecipes() {
    return [];
  },

  async getRecipeById(recipeId) {
    return null;
  },

  async getAll() {
    return this.getAllRecipes();
  },

  async getById(recipeId) {
    const response = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`);
    if (!response.ok) throw new Error("Failed to fetch recipe.");
    return response.json();
  },

  async createRecipe(recipeData) {
    const response = await fetch(`/api/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeData)
    });

    if (!response.ok) {
      throw new Error("Failed to create recipe.");
    }

    return response.json();
  },

  async create(recipeData) {
    return this.createRecipe(recipeData);
  },

  async updateRecipe(recipeId, updatedData) {
    notImplemented("Update recipe");
  },

  async update(recipeId, updatedData) {
    return this.updateRecipe(recipeId, updatedData);
  },

  async deleteRecipe(recipeId) {
    notImplemented("Delete recipe");
  },

  async delete(recipeId) {
    return this.deleteRecipe(recipeId);
  }
};
// ======================
// RECIPE INGREDIENT API
// ======================
export const recipeIngredientAPI = {
  async getByRecipeId(recipeId) {
    const response = await fetch(`/api/recipe-ingredients?recipe_id=${encodeURIComponent(recipeId)}`);
    if (!response.ok) throw new Error("Failed to fetch recipe ingredients.");
    return response.json();
  },

  async create(recipeIngredientData) {
    const response = await fetch(`/api/recipe-ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeIngredientData)
    });

    if (!response.ok) {
      throw new Error("Failed to create recipe ingredient.");
    }

    return response.json();
  }
};

// ======================
// RECIPE STEP API
// ======================
export const recipeStepAPI = {
  async getRecipeStepsByRecipeId(recipeId) {
    const response = await fetch(`/api/recipe-steps?recipe_id=${encodeURIComponent(recipeId)}`);
    if (!response.ok) throw new Error("Failed to fetch recipe steps.");
    return response.json();
  },

  async getRecipeStepByKeys({ recipeId, stepNumber }) {
    const response = await fetch(
      `/api/recipe-steps/${encodeURIComponent(recipeId)}/${encodeURIComponent(stepNumber)}`
    );
    if (!response.ok) throw new Error("Failed to fetch recipe step.");
    return response.json();
  },

  async addRecipeStep(recipeStepData) {
    const response = await fetch(`/api/recipe-steps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeStepData)
    });

    if (!response.ok) throw new Error("Failed to add recipe step.");
    return response.json();
  },

  async updateRecipeStep(recipeId, stepNumber, updatedData) {
    const response = await fetch(
      `/api/recipe-steps/${encodeURIComponent(recipeId)}/${encodeURIComponent(stepNumber)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      }
    );

    if (!response.ok) throw new Error("Failed to update recipe step.");
    return response.json();
  },

  async deleteRecipeStep(recipeId, stepNumber) {
    const response = await fetch(
      `/api/recipe-steps/${encodeURIComponent(recipeId)}/${encodeURIComponent(stepNumber)}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) throw new Error("Failed to delete recipe step.");
    return response.json();
  }
};
