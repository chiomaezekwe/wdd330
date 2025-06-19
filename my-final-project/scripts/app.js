const SPOONACULAR_API_KEY = '62cc66aec27243e78cb8bcbddb6b4843';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

const EDAMAM_APP_ID = 'e52d7fa7';
const EDAMAM_APP_KEY = '28be6cb62f752693d341a21019959c47';
const EDAMAM_BASE_URL = 'https://api.edamam.com/api/nutrition-details';

// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// My actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1FcYlRycH60htgRy8OMGH1bFhlS5tywc",
  authDomain: "smartchef-9001a.firebaseapp.com",
  projectId: "smartchef-9001a",
  appId: "1:474453878282:web:aef38849d00dd31bba61f3d"
};

//Initialize Firebase app and auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const ingredientInput = document.getElementById("ingredient-field");
const addIngredientBtn = document.getElementById("add-ingredient-btn");
const ingredientList = document.getElementById("ingredient-list");
const searchBtn = document.getElementById("search-btn");
const recipeResults = document.getElementById("recipe-results");
const nutritionInfoSection = document.getElementById("nutrition-info");
const recipeDetailsSection = document.getElementById("recipe-details");
const recipeTitle = document.getElementById("recipe-title");
const recipeIngredients = document.getElementById("recipe-ingredients");
const recipeInstructions = document.getElementById("recipe-instructions");
const nutritionDetails = document.getElementById("nutrition-details");
const backToResultsBtn = document.getElementById("back-to-results");
const addToGroceryListBtn = document.getElementById("add-to-grocery-list");
const groceryListSection = document.getElementById("grocery-list");
const groceryItems = document.getElementById("grocery-items");
const clearGroceryListBtn = document.getElementById("clear-grocery-list");

let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
let groceryList = JSON.parse(localStorage.getItem("groceryList")) || [];
let currentRecipe = null;
let recipeCache = {}; // Cache recipe details

// --- Render Functions ---

function renderIngredients() {
  ingredientList.innerHTML = "";
  ingredients.forEach((ing, idx) => {
    const li = document.createElement("li");
    li.textContent = ing;
    li.title = "Click to remove";
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      ingredients.splice(idx, 1);
      saveIngredients();
      renderIngredients();
    });
    ingredientList.appendChild(li);
  });
}

function renderRecipes(recipes) {
  recipeResults.innerHTML = "";
  if (recipes.length === 0) {
    recipeResults.textContent = "No recipes found.";
    return;
  }
  recipes.forEach((recipe) => {
    const li = document.createElement("li");
    li.textContent = recipe.title;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      fetchRecipeDetails(recipe.id);
    });
    recipeResults.appendChild(li);
  });
}

function renderRecipeDetails(recipe) {
  currentRecipe = recipe;
  recipeTitle.textContent = recipe.title;
  recipeIngredients.innerHTML = "";

  // Render ingredients
  recipe.extendedIngredients.forEach((ing) => {
    const li = document.createElement("li");
    li.textContent = ing.original;
    recipeIngredients.appendChild(li);
  });

  // Render instructions
  recipeInstructions.innerHTML = ""; // clear any previous content
  const instructionTitle = document.createElement("h3");
  instructionTitle.textContent = "Preparatory Instructions";
  recipeInstructions.appendChild(instructionTitle);

  // Prefer structured steps if available
  if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
    const steps = recipe.analyzedInstructions[0].steps;
    const ul = document.createElement("ul");
    steps.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step.step;
      ul.appendChild(li);
    });
    recipeInstructions.appendChild(ul);
  } else if (recipe.instructions) {
    //Will fallback to HTML string in instances where structured steps are missing
    const parser = new DOMParser();
    const doc = parser.parseFromString(recipe.instructions, "text/html");
    const paragraphs = doc.querySelectorAll("p");

    const ul = document.createElement("ul");
    if (paragraphs.length > 0) {
      paragraphs.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = p.textContent.trim();
        ul.appendChild(li);
      });
    } else {
      // If not paragraphs, treat as a single text block
      recipe.instructions.split(". ").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed.length > 0) {
          const li = document.createElement("li");
          li.textContent = trimmed.endsWith(".") ? trimmed : trimmed + ".";
          ul.appendChild(li);
        }
      });
    }

    recipeInstructions.appendChild(ul);
  } else {
    recipeInstructions.innerHTML += "<p>No instructions available.</p>";
  }

  // Clear and show nutrition information
  nutritionDetails.innerHTML = "<em>Loading nutrition info...</em>";
  nutritionInfoSection.classList.remove("hidden");

  fetchNutritionInfo(recipe.extendedIngredients.map(i => i.original));

  recipeDetailsSection.classList.remove("hidden");
  document.getElementById("recipe-search").classList.add("hidden");
}

function renderNutritionInfo(data) {
  nutritionDetails.innerHTML = "";
  if (!data || !data.calories) {
    nutritionDetails.textContent = "No nutrition info available.";
    return;
  }
  const ul = document.createElement("ul");
  ul.innerHTML = `
    <li><strong>Calories:</strong> ${data.calories}</li>
    <li><strong>Protein:</strong> ${data.totalNutrients.PROCNT?.quantity.toFixed(1)} ${data.totalNutrients.PROCNT?.unit}</li>
    <li><strong>Fat:</strong> ${data.totalNutrients.FAT?.quantity.toFixed(1)} ${data.totalNutrients.FAT?.unit}</li>
    <li><strong>Carbs:</strong> ${data.totalNutrients.CHOCDF?.quantity.toFixed(1)} ${data.totalNutrients.CHOCDF?.unit}</li>
    <li><strong>Fiber:</strong> ${data.totalNutrients.FIBTG?.quantity.toFixed(1)} ${data.totalNutrients.FIBTG?.unit}</li>
  `;
  nutritionDetails.appendChild(ul);
}

function showRecipeResults() {
  recipeDetailsSection.classList.add("hidden");
  nutritionInfoSection.classList.add("hidden");
  document.getElementById("recipe-search").classList.remove("hidden");
}

function renderGroceryList() {
  groceryItems.innerHTML = "";
  if (groceryList.length === 0) {
    groceryItems.textContent = "Your grocery list is empty.";
    return;
  }
  groceryList.forEach((item, idx) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.title = "Click to remove";
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      groceryList.splice(idx, 1);
      saveGroceryList();
      renderGroceryList();
    });
    groceryItems.appendChild(li);
  });
}

//Define logout function globally
window.logout = function () {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
};
// --- Storage Functions ---
function saveIngredients() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

function saveGroceryList() {
  localStorage.setItem("groceryList", JSON.stringify(groceryList));
}

// --- API Calls ---

async function searchRecipes() {
  if (ingredients.length === 0) {
    alert("Please add at least one ingredient.");
    return;
  }
  const query = ingredients.join(",");
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(query)}&number=10&apiKey=${SPOONACULAR_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch recipes");
    const data = await response.json();
    const recipes = data.map((r) => ({
      id: r.id,
      title: r.title,
    }));
    renderRecipes(recipes);
  } catch (error) {
    recipeResults.textContent = "Error fetching recipes.";
    console.error(error);
  }
}

async function fetchRecipeDetails(id) {
  if (recipeCache[id]) {
    renderRecipeDetails(recipeCache[id]);
    return;
  }
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/recipes/${id}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`
    );
    if (!response.ok) throw new Error("Failed to fetch recipe details");
    const data = await response.json();
    recipeCache[id] = data;
    renderRecipeDetails(data);
  } catch (error) {
    alert("Error fetching recipe details.");
    console.error(error);
  }
}

async function fetchNutritionInfo(ingredientLines) {
  try {
    const response = await fetch(
      `${EDAMAM_BASE_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingr: ingredientLines }),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch nutrition info");
    const data = await response.json();
    renderNutritionInfo(data);
  } catch (error) {
    nutritionDetails.textContent = "Error loading nutrition info.";
    console.error(error);
  }
}

//Event Listeners

addIngredientBtn.addEventListener("click", () => {
  const value = ingredientInput.value.trim();
  if (value && !ingredients.includes(value)) {
    ingredients.push(value);
    saveIngredients();
    renderIngredients();
    ingredientInput.value = "";
  }
});

searchBtn.addEventListener("click", () => {
  searchRecipes();
});

backToResultsBtn.addEventListener("click", () => {
  showRecipeResults();
});

addToGroceryListBtn.addEventListener("click", () => {
  if (!currentRecipe) return;
  currentRecipe.extendedIngredients.forEach((ing) => {
    if (!groceryList.includes(ing.original)) groceryList.push(ing.original);
  });
  saveGroceryList();
  renderGroceryList();
  //alert - "Ingredients added to grocery list!";
  const groceryMessage = document.getElementById("grocery-message");
  groceryMessage.textContent = "Ingredients added to grocery list!";
  groceryMessage.classList.remove("hidden");

  setTimeout(() => {
    groceryMessage.classList.add("hidden");
  }, 3000); // hides after 3 seconds
  });
  

clearGroceryListBtn.addEventListener("click", () => {
  groceryList = [];
  saveGroceryList();
  renderGroceryList();
});

// Initial Render
renderIngredients();
renderRecipes([]);
renderGroceryList();
nutritionInfoSection.classList.add("hidden");

