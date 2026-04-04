// utils.js

// ============================
// DOM HELPERS
// ============================
export function $(selector, scope = document) {
    return scope.querySelector(selector);
  }
  
  export function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }
  
  export function on(element, eventName, handler) {
    if (!element) return;
    element.addEventListener(eventName, handler);
  }
  
  export function onDelegate(parent, eventName, selector, handler) {
    if (!parent) return;
  
    parent.addEventListener(eventName, (event) => {
      const matchedElement = event.target.closest(selector);
  
      if (matchedElement && parent.contains(matchedElement)) {
        handler(event, matchedElement);
      }
    });
  }
  
  export function show(element, displayValue = "block") {
    if (!element) return;
    element.style.display = displayValue;
  }
  
  export function hide(element) {
    if (!element) return;
    element.style.display = "none";
  }
  
  export function toggle(element, shouldShow, displayValue = "block") {
    if (!element) return;
    element.style.display = shouldShow ? displayValue : "none";
  }
  
  export function clearElement(element) {
    if (!element) return;
    element.innerHTML = "";
  }
  
  // ============================
  // FORM HELPERS
  // ============================
  export function getFormData(form) {
    if (!form) return {};
  
    const formData = new FormData(form);
    const data = {};
  
    for (const [key, value] of formData.entries()) {
      data[key] = typeof value === "string" ? value.trim() : value;
    }
  
    return data;
  }
  
  export function getFormDataWithTypes(form, config = {}) {
    if (!form) return {};
  
    const rawData = getFormData(form);
    const parsedData = {};
  
    Object.keys(rawData).forEach((key) => {
      const value = rawData[key];
      const fieldType = config[key];
  
      switch (fieldType) {
        case "number":
          parsedData[key] = value === "" ? null : Number(value);
          break;
  
        case "float":
          parsedData[key] = value === "" ? null : parseFloat(value);
          break;
  
        case "int":
          parsedData[key] = value === "" ? null : parseInt(value, 10);
          break;
  
        case "date":
          parsedData[key] = value === "" ? null : value;
          break;
  
        case "string":
        default:
          parsedData[key] = value;
          break;
      }
    });
  
    return parsedData;
  }
  
  export function fillForm(form, data = {}) {
    if (!form) return;
  
    Object.keys(data).forEach((key) => {
      const field = form.elements[key];
      if (!field) return;
  
      field.value = data[key] ?? "";
    });
  }
  
  export function resetForm(form) {
    if (!form) return;
    form.reset();
  }
  
  export function setHiddenInputValue(form, inputName, value) {
    if (!form) return;
  
    const field = form.elements[inputName];
    if (!field) return;
  
    field.value = value ?? "";
  }
  
  export function getInputValue(input) {
    if (!input) return "";
    return input.value.trim();
  }
  
  // ============================
  // FORM MODE HELPERS
  // ============================
  export function setFormMode(form, mode) {
    if (!form) return;
    form.dataset.mode = mode;
  }
  
  export function getFormMode(form) {
    if (!form) return "add";
    return form.dataset.mode || "add";
  }
  
  export function isEditMode(form) {
    return getFormMode(form) === "edit";
  }
  
  export function isAddMode(form) {
    return getFormMode(form) === "add";
  }
  
  // ============================
  // VALIDATION HELPERS
  // ============================
  export function isEmpty(value) {
    return value == null || String(value).trim() === "";
  }
  
  export function hasRequiredFields(data, requiredFields = []) {
    return requiredFields.every((field) => !isEmpty(data[field]));
  }
  
  export function getMissingFields(data, requiredFields = []) {
    return requiredFields.filter((field) => isEmpty(data[field]));
  }
  
  // ============================
  // TABLE / RENDER HELPERS
  // ============================
  export function createCell(content = "") {
    const td = document.createElement("td");
  
    if (content instanceof Node) {
      td.appendChild(content);
    } else {
      td.textContent = content ?? "";
    }
  
    return td;
  }
  
  export function createRow(cells = []) {
    const tr = document.createElement("tr");
  
    cells.forEach((cell) => {
      tr.appendChild(createCell(cell));
    });
  
    return tr;
  }
  
  export function createButton({
    text = "",
    className = "",
    type = "button",
    dataset = {}
  } = {}) {
    const button = document.createElement("button");
    button.type = type;
    button.textContent = text;
    button.className = className;
  
    Object.entries(dataset).forEach(([key, value]) => {
      button.dataset[key] = value;
    });
  
    return button;
  }
  
  export function createActionButtons(actions = []) {
    const wrapper = document.createElement("div");
    wrapper.className = "table-actions";
  
    actions.forEach((action) => {
      const button = createButton(action);
      wrapper.appendChild(button);
    });
  
    return wrapper;
  }
  
  export function renderTableBody(tbody, rows = []) {
    if (!tbody) return;
  
    clearElement(tbody);
  
    rows.forEach((row) => {
      tbody.appendChild(row);
    });
  }
  
  export function renderEmptyState(tbody, message, colSpan = 1) {
    if (!tbody) return;
  
    clearElement(tbody);
  
    const tr = document.createElement("tr");
    const td = document.createElement("td");
  
    td.colSpan = colSpan;
    td.textContent = message;
  
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  
  // ============================
  // STATUS / MESSAGE HELPERS
  // ============================
  export function setText(element, text = "") {
    if (!element) return;
    element.textContent = text;
  }
  
  export function showMessage(element, message, type = "info") {
    if (!element) return;
  
    element.textContent = message;
    element.classList.remove("success", "error", "info", "warning");
    element.classList.add(type);
    show(element);
  }
  
  export function clearMessage(element) {
    if (!element) return;
  
    element.textContent = "";
    element.classList.remove("success", "error", "info", "warning");
    hide(element);
  }
  
  // ============================
  // VALUE / FORMAT HELPERS
  // ============================
  export function toNumber(value) {
    if (value === "" || value == null) return null;
  
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }
  
  export function formatCurrency(value) {
    const numberValue = Number(value);
  
    if (Number.isNaN(numberValue)) return "";
  
    return `$${numberValue.toFixed(2)}`;
  }
  
  export function capitalize(text = "") {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  // ============================
  // DATA HELPERS
  // ============================
  export function normalizeStudentData(data) {
    return {
      studentId: data.studentId ?? null,
      name: data.name ?? "",
      email: data.email ?? "",
      password: data.password ?? "",
      budgetPerWeek: toNumber(data.budgetPerWeek),
      zipCode: data.zipCode ?? "",
      profilePictureUrl: data.profilePictureUrl ?? "",
      themePreference: data.themePreference ?? ""
    };
  }
  
  export function normalizeIngredientData(data) {
    return {
      ingredientId: data.ingredientId ?? null,
      name: data.name ?? "",
      category: data.category ?? "",
      protein: toNumber(data.protein),
      calories: toNumber(data.calories),
      nutritionScore: toNumber(data.nutritionScore),
      imageUrl: data.imageUrl ?? ""
    };
  }
  
  export function normalizePantryData(data) {
    return {
      pantryId: data.pantryId ?? null,
      type: data.type ?? "",
      location: data.location ?? ""
    };
  }
  
  export function normalizePantryItemData(data) {
    return {
      pantryId: data.pantryId ?? null,
      ingredientId: data.ingredientId ?? null,
      unit: data.unit ?? "",
      dateAdded: data.dateAdded ?? "",
      expirationDate: data.expirationDate ?? "",
      quantity: toNumber(data.quantity)
    };
  }
  
  export function normalizeStoreData(data) {
    return {
      storeId: data.storeId ?? null,
      name: data.name ?? "",
      address: data.address ?? ""
    };
  }
  
  export function normalizePurchaseData(data) {
    return {
      purchaseId: data.purchaseId ?? null,
      storeId: data.storeId ?? null,
      ingredientId: data.ingredientId ?? null,
      studentId: data.studentId ?? null,
      date: data.date ?? "",
      price: toNumber(data.price),
      quantity: toNumber(data.quantity),
      unit: data.unit ?? ""
    };
  }
  
  export function normalizeRecipeData(data) {
    return {
      recipeId: data.recipeId ?? null,
      name: data.name ?? "",
      type: data.type ?? "",
      servings: toNumber(data.servings),
      totalTimePrep: toNumber(data.totalTimePrep)
    };
  }
  
  export function normalizeRecipeIngredientData(data) {
    return {
      recipeId: data.recipeId ?? null,
      ingredientId: data.ingredientId ?? null,
      amount: toNumber(data.amount),
      unit: data.unit ?? ""
    };
  }
  
  export function normalizeRecipeStepData(data) {
    return {
      recipeId: data.recipeId ?? null,
      stepNumber: toNumber(data.stepNumber),
      description: data.description ?? ""
    };
  }
  