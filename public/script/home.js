const diff = ['facile', 'moyen', 'difficile'];

function capitalize(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function singulier(str) {
  return str.slice(-1).toLowerCase() == 's' ? str.slice(0, str.length - 1) : str; 
}

const recettesContainer = document.getElementById('liste');

async function recetteSynthese(r) {
    var res = `${r.category}`;
    if (r.difficulty) {
        res += ` • ${capitalize(diff[r.difficulty - 1])}`;
    }
    if (r.price) {
        res += ` • ${"€".repeat(r.price)}`;
    }
    if (r.prep_time) {
        res += ` • ${r.prep_time} min`;
    }
    return res;
};

async function putNote(r) {
    if (r.note) {
        return `<span class="recette-note">&#9733;&#160;${r.note}/5</span>`;
    }
    return '';
}

async function creerCarte(r) {
    const carte = document.createElement('a');
    carte.href = `r?r=${r.slug}`;
    carte.innerHTML = `
        <div class="recette">
            <div class="recette-image">
                <img src="assets/recettes-cover/${r.image}" alt="${r.title}">
            </div>
            <div class="recette-details">
                    <h2 class="recette-titre">${r.title}
                        ${await putNote(r)}
                    </h2>
                <p class="recette-description">${r.description}</p>
                <p class="recette-synthese">${await recetteSynthese(r)}</p>
            </div>
        </div>
    `
    return carte;
};

// FILTRES

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('/recipes');
    const allRecipes = await response.json();
    
    const uniqueAuthors = [...new Set(allRecipes.map(r => r.author))].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    const authorsUl = document.getElementById('authors-select');
    
    if (authorsUl) {
      for (const author of uniqueAuthors) {
        const authorLi = document.createElement('li');
        authorLi.innerHTML = `<input type="checkbox" value="${author}"> ${capitalize(author)}`;
        authorsUl.appendChild(authorLi);
      }
    }
  } catch (e) {
    console.error("Erreur chargement auteurs", e);
  }

  try {
    const response = await fetch('/ingredients');
    const ingredients = await response.json();
    
    ingredients.sort((a, b) => {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const ingredientsUl = document.getElementById('ingredients-select');
    if (ingredientsUl) {
      for (const ingredient of ingredients) {
        const ingredientLi = document.createElement('li');
        ingredientLi.innerHTML = `<input type="checkbox" value="${ingredient.id}"> ${capitalize(ingredient.name)}`;
        ingredientsUl.appendChild(ingredientLi);
      }
    }
  } catch (e) {
    console.error("Erreur chargement ingrédients", e);
  }

  const customSelects = document.querySelectorAll(".filter");

  customSelects.forEach((customSelect) => {
    const selectButton = customSelect.querySelector(".dropdown-btn");
    const buttonText = customSelect.querySelector(".dropdown-btn-text");
    const dropdown = customSelect.querySelector(".dropdown-select");
    const defaultButtonText = buttonText.textContent;

    document.body.appendChild(dropdown);

    const updateDropdownPosition = () => {
      const rect = selectButton.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 5}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.minWidth = `${rect.width}px`;
    };

    const toggleDropdown = (expand = null) => {
      const isOpen = expand !== null ? expand : dropdown.classList.contains("hidden");
      if (isOpen) {
        updateDropdownPosition();
        dropdown.classList.remove("hidden");
      } else {
        dropdown.classList.add("hidden");
      }
      selectButton.setAttribute("aria-expanded", isOpen);
    };

    selectButton.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".dropdown-select").forEach((el) => {
        if (el !== dropdown) el.classList.add("hidden");
      });
      toggleDropdown();
    });

    // Notes
    const ratingRange = dropdown.querySelector("#rating-range");
    const ratingValueDisplay = dropdown.querySelector("#rating-value");
    if (ratingRange) {
      ratingRange.addEventListener("input", async () => {
        const val = parseInt(ratingRange.value);
        if (val === 0) {
          ratingValueDisplay.textContent = "Toutes les notes";
          buttonText.textContent = defaultButtonText;
          customSelect.classList.remove("is-active");
        } else {
          ratingValueDisplay.textContent = `${val}/5`;
          buttonText.textContent = `Min. ${val}/5`;
          customSelect.classList.add("is-active");
        }
        await updateRecettes();
      });
    }

    // temps de prep
    const prepTimeRange = dropdown.querySelector("#preptime-range");
    const prepTimeValueDisplay = dropdown.querySelector("#preptime-value");
    if (prepTimeRange) {
      prepTimeRange.min = "0";
      prepTimeRange.max = "120";
      prepTimeRange.step = "1";
      prepTimeRange.value = "0";

      prepTimeRange.addEventListener("input", async () => {
        const val = parseInt(prepTimeRange.value);
        if (val === 0) {
          prepTimeValueDisplay.textContent = "Toutes durées";
          buttonText.textContent = defaultButtonText;
          customSelect.classList.remove("is-active");
        } else {
          prepTimeValueDisplay.textContent = `Max. ${val} min`;
          buttonText.textContent = `Max. ${val} min`;
          customSelect.classList.add("is-active");
        }
        await updateRecettes();
      });
    }

    // Prix
    const maxPriceRange = dropdown.querySelector("#maxprice-range");
    const maxPriceValueDisplay = dropdown.querySelector("#maxprice-value");
    if (maxPriceRange) {
      maxPriceRange.min = "0";
      maxPriceRange.max = "3";
      maxPriceRange.step = "1";
      maxPriceRange.value = "0";

      maxPriceRange.addEventListener("input", async () => {
        const val = parseInt(maxPriceRange.value);
        if (val === 0) {
          maxPriceValueDisplay.textContent = "Tous les prix";
          buttonText.textContent = defaultButtonText;
          customSelect.classList.remove("is-active");
        } else {
          maxPriceValueDisplay.textContent = "€".repeat(val);
          buttonText.textContent = `Prix max. ${"€".repeat(val)}`;
          customSelect.classList.add("is-active");
        }
        await updateRecettes();
      });
    }

    // Ing et auteurs)
    const isCheckboxList = dropdown.classList.contains("checkbox-list");
    if (isCheckboxList) {
      dropdown.addEventListener("click", async (ev) => {
        const li = ev.target.closest("li");
        if (!li) return;

        const checkbox = li.querySelector("input[type='checkbox']");
        const defaultOption = dropdown.querySelector(".default-option");
        const checkboxes = dropdown.querySelectorAll("input[type='checkbox']");

        if (li.classList.contains("default-option")) {
          checkboxes.forEach((cb) => (cb.checked = false));
          buttonText.textContent = defaultButtonText;
          customSelect.classList.remove("is-active");
          defaultOption.classList.add("selected");
        } else if (checkbox) {
          checkbox.checked = !checkbox.checked;
          
          const checkedCount = dropdown.querySelectorAll("input[type='checkbox']:checked").length;
          if (checkedCount === 0) {
            buttonText.textContent = defaultButtonText;
            customSelect.classList.remove("is-active");
            defaultOption.classList.add("selected");
          } else {
            buttonText.textContent = `${defaultButtonText} (${checkedCount})`;
            customSelect.classList.add("is-active");
            defaultOption.classList.remove("selected");
          }
        }
        await updateRecettes();
      });
    }

    // catégories et difficulté)
    const options = dropdown.querySelectorAll("li:not(.default-option)");
    const defaultOptionCat = dropdown.querySelector(".default-option");
    
    if (!isCheckboxList && !ratingRange && !prepTimeRange && !maxPriceRange) {
      if (defaultOptionCat) {
        defaultOptionCat.addEventListener("click", async () => {
          buttonText.textContent = defaultButtonText;
          customSelect.classList.remove("is-active");
          dropdown.querySelectorAll("li").forEach((opt) => opt.classList.remove("selected"));
          defaultOptionCat.classList.add("selected");
          toggleDropdown(false);
          await updateRecettes();
        });
      }

      options.forEach((option) => {
        option.addEventListener("click", async () => {
          buttonText.textContent = option.textContent;
          customSelect.classList.add("is-active");
          
          dropdown.querySelectorAll("li").forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");

          toggleDropdown(false);
          await updateRecettes();
        });
      });
    }

    document.addEventListener("click", (e) => {
      if (!customSelect.contains(e.target) && !dropdown.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    window.addEventListener("resize", () => toggleDropdown(false));
  });

  await updateRecettes();
});

// RECETTES ET FETCH

const titleInput = document.getElementById('recherche-input');

async function updateRecettes() {
  const filtres = {};

  filtres.title = titleInput ? titleInput.value : '';

  const fetchCategory = document.querySelector('#category-select .selected');
  filtres.category = fetchCategory && !fetchCategory.classList.contains('default-option') ? fetchCategory.textContent.trim() : null;

  const fetchAuthors = document.querySelectorAll('#authors-select input[type="checkbox"]:checked');
  filtres.authors = Array.from(fetchAuthors).map(author => author.value);

  const fetchNote = document.querySelector('#rating-range');
  filtres.note = fetchNote ? parseInt(fetchNote.value) : 0;

  const fetchPrepTime = document.querySelector('#preptime-range');
  filtres.prep_time = fetchPrepTime ? parseInt(fetchPrepTime.value) : 0;

  const fetchMaxPrice = document.querySelector('#maxprice-range');
  filtres.maxprice = fetchMaxPrice ? parseInt(fetchMaxPrice.value) : 0;

  const fetchIngredients = document.querySelectorAll('#ingredients-select input[type="checkbox"]:checked');
  filtres.ingredients = Array.from(fetchIngredients).map(ing => ing.value);

  const fetchDifficulty = document.querySelector('#difficulty-select .selected');
  filtres.difficulty = fetchDifficulty && !fetchDifficulty.classList.contains('default-option') ? fetchDifficulty.textContent.trim().toLowerCase() : null;

  const params = new URLSearchParams();

  if (filtres.title) params.append('title', filtres.title);
  if (filtres.category) params.append('category', singulier(filtres.category));
  if (filtres.note > 0) params.append('note', filtres.note);
  if (filtres.prep_time > 0) params.append('prep_time', filtres.prep_time);
  if (filtres.maxprice > 0) params.append('maxprice', filtres.maxprice);
  if (filtres.authors.length > 0) params.append('authors', filtres.authors.join(','));
  if (filtres.ingredients.length > 0) params.append('ingredients', filtres.ingredients.join(','));
  
  if (filtres.difficulty) {
    const diffMap = { 'facile': 1, 'moyen': 2, 'difficile': 3 };
    if (diffMap[filtres.difficulty]) params.append('difficulty', diffMap[filtres.difficulty]);
  }

  const response = await fetch(`/recipes?${params.toString()}`);
  const recettes = await response.json();
  
  recettesContainer.innerHTML = '';
  if (recettes.length == 0) {
      recettesContainer.innerHTML = '<p style="text-align: center;"><i>Aucune recette</i></p>';
  } else {
      for(const recette of recettes) {
          recettesContainer.appendChild(await creerCarte(recette));
      }
  }
}

if (titleInput) {
    titleInput.addEventListener('input', async () => {
        await updateRecettes();
    });
}