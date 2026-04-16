// api.js


const BASE_URL = "http://localhost:3000/api";

function notImplemented(feature) {
  throw new Error(`${feature} is not implemented yet.`);
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// ======================
// STUDENT API
// ======================
export const studentAPI = {
  async getById(studentId) {
    const response = await fetch(`${BASE_URL}/students/${encodeURIComponent(studentId)}`);
    return handleResponse(response);
  },

  async getByEmail(email) {
    const response = await fetch(`${BASE_URL}/students/email/${encodeURIComponent(email)}`);
    return handleResponse(response);
  },

  async create(studentData) {
    const response = await fetch(`${BASE_URL}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(studentData)
    });
    return handleResponse(response);
  },

  async update(studentId, updatedData) {
    const response = await fetch(`${BASE_URL}/students/${encodeURIComponent(studentId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });
    return handleResponse(response);
  },

  async updateThemePreference(studentId, themePreference) {
    const response = await fetch(`${BASE_URL}/students/${encodeURIComponent(studentId)}/theme`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ theme_preference: themePreference })
    });
    return handleResponse(response);
  },

  async updateBudget(studentId, budgetPerWeek) {
    const response = await fetch(`${BASE_URL}/students/${encodeURIComponent(studentId)}/budget`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ budget_per_week: budgetPerWeek })
    });
    return handleResponse(response);
  },

  async delete(studentId) {
    const response = await fetch(`${BASE_URL}/students/${encodeURIComponent(studentId)}`, {
      method: "DELETE"
    });
    return handleResponse(response);
  }
};

// ======================
// AUTH API
// ======================
export const authAPI = {
  async login({ email, password }) {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }

    return response.json();
  }
};

// ======================
// PANTRY API
// ======================
export const pantryAPI = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/pantries`);
    return handleResponse(response);
  },

  async getByStudentId(studentId) {
    const response = await fetch(`${BASE_URL}/pantries/student/${encodeURIComponent(studentId)}`);
    return handleResponse(response);
  },

  async create(pantryData) {
    const response = await fetch(`${BASE_URL}/pantries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pantryData)
    });

    return handleResponse(response);
  }
};

// ======================
// INGREDIENT API
// ======================
export const ingredientAPI = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/ingredients`);
    return handleResponse(response);
  },

  async getById(ingredientId) {
    const response = await fetch(`${BASE_URL}/ingredients/${encodeURIComponent(ingredientId)}`);
    return handleResponse(response);
  },

  async create(ingredientData) {
    const response = await fetch(`${BASE_URL}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ingredientData)
    });

    return handleResponse(response);
  },

  async update(ingredientId, updatedData) {
    const response = await fetch(`${BASE_URL}/ingredients/${encodeURIComponent(ingredientId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    return handleResponse(response);
  }
};
// ======================
// PANTRY ITEM API
// ======================
export const pantryItemAPI = {
  async getByPantryId(pantryId) {
    const response = await fetch(`${BASE_URL}/pantry-items/pantry/${encodeURIComponent(pantryId)}`);
    return handleResponse(response);
  },
  async getByStudentId(studentId) {
    const response = await fetch(`${BASE_URL}/pantry-items/student/${encodeURIComponent(studentId)}`);
    return handleResponse(response);
  },

  async create(pantryItemData) {
    const response = await fetch(`${BASE_URL}/pantry-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pantryItemData)
    });

    return handleResponse(response);
  },

  async update(pantryItemId, updatedData) {
    const response = await fetch(`${BASE_URL}/pantry-items/${encodeURIComponent(pantryItemId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    return handleResponse(response);
  },

  async delete(pantryItemId) {
    const response = await fetch(`${BASE_URL}/pantry-items/${encodeURIComponent(pantryItemId)}`, {
      method: "DELETE"
    });
  
    return handleResponse(response);
  }
};



// ======================
// STORE API
// ======================
export const storeAPI = {
  async getAll() {
    const response = await fetch("http://localhost:3000/api/stores");
    if (!response.ok) throw new Error("Failed to fetch stores");
    return response.json();
  },

  async create(storeData) {
    const response = await fetch("http://localhost:3000/api/stores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(storeData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create store");
    }

    return response.json();
  },

  async delete(storeId) {
    const response = await fetch(`http://localhost:3000/api/stores/${storeId}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error("Delete failed");
  }
};

// ======================
// PURCHASED INGREDIENT API
// ======================
export const purchaseAPI = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/purchases`);
    return handleResponse(response);
  },

  async getPurchasesByStoreIdAndStudentId(storeId, studentId) {
    const response = await fetch(
      `${BASE_URL}/purchases/store/${encodeURIComponent(storeId)}/student/${encodeURIComponent(studentId)}`
    );
    return handleResponse(response);
  },

  async createPurchase(purchaseData) {
    const response = await fetch(`${BASE_URL}/purchases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(purchaseData)
    });

    return handleResponse(response);
  },

  async updatePurchase(purchaseId, updatedData) {
    const response = await fetch(`${BASE_URL}/purchases/${encodeURIComponent(purchaseId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    return handleResponse(response);
  }
};

// ======================
// RECIPE API
// ======================
export const recipeAPI = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/recipes`);
    return handleResponse(response);
  },

  async getById(recipeId) {
    const response = await fetch(`${BASE_URL}/recipes/${encodeURIComponent(recipeId)}`);
    return handleResponse(response);
  },

  async create(recipeData) {
    const response = await fetch(`${BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeData)
    });

    return handleResponse(response);
  },

  async delete(recipeId) {
    const response = await fetch(`${BASE_URL}/recipes/${encodeURIComponent(recipeId)}`, {
      method: "DELETE"
    });

    return handleResponse(response);
  }
};
// ======================
// RECIPE INGREDIENT API
// ======================
export const recipeIngredientAPI = {
  async getAll() {
    const response = await fetch(`${BASE_URL}/recipe-ingredients`);
    return handleResponse(response);
  },

  async getByRecipeId(recipeId) {
    const response = await fetch(
      `${BASE_URL}/recipe-ingredients?recipe_id=${encodeURIComponent(recipeId)}`
    );
    return handleResponse(response);
  },

  async create(recipeIngredientData) {
    const response = await fetch(`${BASE_URL}/recipe-ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeIngredientData)
    });

    return handleResponse(response);
  }
};
// ======================
// RECIPE STEP API
// ======================
export const recipeStepAPI = {
  async getRecipeStepsByRecipeId(recipeId) {
    const response = await fetch(
      `${BASE_URL}/recipe-steps?recipe_id=${encodeURIComponent(recipeId)}`
    );
    return handleResponse(response);
  },

  async getRecipeStepByKeys({ recipeId, stepNumber }) {
    const response = await fetch(
      `${BASE_URL}/recipe-steps/${encodeURIComponent(recipeId)}/${encodeURIComponent(stepNumber)}`
    );
    return handleResponse(response);
  },

  async addRecipeStep(recipeStepData) {
    const response = await fetch(`${BASE_URL}/recipe-steps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeStepData)
    });

    return handleResponse(response);
  },

  async updateRecipeStep(recipeId, stepNumber, updatedData) {
    const response = await fetch(
      `${BASE_URL}/recipe-steps/${encodeURIComponent(recipeId)}/${encodeURIComponent(stepNumber)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      }
    );

    return handleResponse(response);
  },

  async deleteRecipeStep(recipeId, stepNumber) {
    const response = await fetch(
      `${BASE_URL}/recipe-steps/${encodeURIComponent(recipeId)}/${encodeURIComponent(stepNumber)}`,
      {
        method: "DELETE"
      }
    );

    return handleResponse(response);
  }
};
//

