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
  
    async createRecipe(recipeData) {
      notImplemented("Create recipe");
    },
  
    async updateRecipe(recipeId, updatedData) {
      notImplemented("Update recipe");
    },
  
    async deleteRecipe(recipeId) {
      notImplemented("Delete recipe");
    }
  };
  
  // ======================
  // RECIPE INGREDIENT API
  // ======================
  export const recipeIngredientAPI = {
    async getRecipeIngredientsByRecipeId(recipeId) {
      return [];
    },
  
    async getRecipeIngredientByKeys({ recipeId, ingredientId }) {
      return null;
    },
  
    async addRecipeIngredient(recipeIngredientData) {
      notImplemented("Add recipe ingredient");
    },
  
    async updateRecipeIngredient(recipeId, ingredientId, updatedData) {
      notImplemented("Update recipe ingredient");
    },
  
    async deleteRecipeIngredient(recipeId, ingredientId) {
      notImplemented("Delete recipe ingredient");
    }
  };
  
  // ======================
  // RECIPE STEP API
  // ======================
  export const recipeStepAPI = {
    async getRecipeStepsByRecipeId(recipeId) {
      return [];
    },
  
    async getRecipeStepByKeys({ recipeId, stepNumber }) {
      return null;
    },
  
    async addRecipeStep(recipeStepData) {
      notImplemented("Add recipe step");
    },
  
    async updateRecipeStep(recipeId, stepNumber, updatedData) {
      notImplemented("Update recipe step");
    },
  
    async deleteRecipeStep(recipeId, stepNumber) {
      notImplemented("Delete recipe step");
    }
  };