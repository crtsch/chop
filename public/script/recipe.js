// Etape faite

async function initEtapesCheck() {
    const etapes = document.getElementsByClassName('etape');
    Array.from(etapes).forEach((etape) => {
        etape.addEventListener('click', (e) => {
            if(etape.children[1].style.textDecoration == 'line-through') {
                etape.style.backgroundColor = '';
                etape.children[0].style.backgroundImage = 'linear-gradient(to right, rgba(var(--accent), 1) 0%, rgba(var(--accent), 0) 80%)';
                etape.children[0].style.color = 'rgb(var(--bg))';
                etape.children[1].style.textDecoration = 'none';
            }
            else {
                etape.style.backgroundColor = '#e2f6e5';
                etape.children[0].style.backgroundImage = 'linear-gradient(to right, rgb(29, 165, 11) 0%, #e2f6e5 80%)';
                etape.children[0].style.color = '#e2f6e5';
                etape.children[1].style.textDecoration = 'line-through';
            }
        })
    })
}


// Ingrédient check

async function initIngredientCheck() {
    const ingredientsListe = document.getElementsByClassName('ingredient');
    Array.from(ingredientsListe).forEach((ingredient) => {
        ingredient.addEventListener('click', (e) => {
            if(ingredient.style.backgroundColor == '' || ingredient.style.backgroundColor == 'rgb(var(--bg))') {
                ingredient.style.backgroundColor = '#e2f6e5';
            }
            else {
                ingredient.style.backgroundColor = '';
            }
        })
    })
};



// Charger la recette

const params = new URLSearchParams(window.location.search);
const r = params.get('r');

let recipe = null;
let ingredients = [];
let quantites = [];
let k = 0;

const ingredientsContainer = document.getElementById('ingredients');
const etapesContainer = document.getElementById('etapes');
let recetteEtapes = [];


async function ajouterIngredient(ingredient) {
    const ingredientCarte = document.createElement('div');
    ingredientCarte.classList.add('ingredient');
    const ingredientImg = document.createElement('img');
    ingredientImg.src = `assets/ingredients/${ingredient.image}`;
    ingredientImg.alt = ingredient.name;
    const ingredientNom = document.createElement('p');
    ingredientNom.classList.add('ingredient-nom');
    ingredientNom.innerText = ingredient.name;
    const ingredientQuantite = document.createElement('p');
    ingredientQuantite.classList.add('ingredient-quantite');
    ingredientQuantite.innerText = `? ??`;
    ingredientCarte.appendChild(ingredientImg);
    ingredientCarte.appendChild(ingredientNom);
    ingredientCarte.appendChild(ingredientQuantite);
    return ingredientCarte;
}


async function ajouterEtape(i) {
    const etapeDiv = document.createElement('div');
    etapeDiv.classList.add('etape');
    etapeDiv.innerHTML = `<p class='etape-num'>${i+1}</p>
                          <p class='etape-desc'>${recetteEtapes[i]}</p>`;
    return etapeDiv;
}


async function renderRecette(recipe, ingredients) {
    document.title = `${recipe.title} | CHOP`;
    
    const image = document.getElementById('image');
    image.style.background = `linear-gradient(rgba(var(--accent), 0.1) 50%, rgba(var(--accent), 0.6) 100%),
                      linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.5)) 100%,
                      url(../assets/recettes-cover/${recipe.image})`;
    image.querySelector('h1').innerText = recipe.title;

    const infos = document.getElementById('infos');
    infos.innerHTML = '';
    if(recipe.category) {
        infos.innerHTML += `
            <div class="info">
                <img src="assets/icones/categorie.svg" alt="🍽️">
                <span>${recipe.category}</span>
            </div>`;
    };
    if(recipe.difficulty) {
        infos.innerHTML += `
            <div class="info">
                <img src="assets/icones/difficulte.svg" alt="⚡">
                <span>${recipe.difficulty}</span>
            </div>`
    };
    if(recipe.price) {
        infos.innerHTML += `
            <div class="info">
                <img src="assets/icones/prix.svg" alt="🪙">
                <span>${recipe.price}</span>
            </div>`;
    };
    var time = '<div class="info">';
    if(recipe.prep_time) {
        time += `
            <img src="assets/icones/toque.svg" alt="⏱️">
            <span>${recipe.prep_time} min</span>`;
    }
    else {
        time += `
            <img src="assets/icones/toque.svg" alt="⏱️">
            <span>0 min</span>`;
    };
    if(recipe.rest_time && recipe.rest_time > 0) {
        time += `
            <span class="plus">+</span>
            <img src="assets/icones/repos.svg" alt="😴">
            <span>${recipe.rest_time} min</span>`;
    };
    if(recipe.cook_time && recipe.cook_time > 0) {
        time += `
            <span class="plus">+</span>
            <img src="assets/icones/four.svg" alt="🔥">
            <span>${recipe.cook_time} min</span>`;
    };
    time += '</div>';
    infos.innerHTML += time;

    if(recipe.note) {
        infos.innerHTML += `
            <div class="info">
                <img src="assets/icones/etoile_rose.svg" alt="⭐">
                <span>${recipe.note}/5</span>
            </div>`;
    };

    ingredientsContainer.innerHTML = '';
    for(const ing of ingredients) {
        ingredientsContainer.appendChild(await ajouterIngredient(ing));
    }
    await initIngredientCheck();

    recetteEtapes = JSON.parse(recipe.steps);
    etapesContainer.innerHTML = '';

    for(var i = 0; i < recetteEtapes.length; i++) {
        etapesContainer.appendChild(await ajouterEtape(i));
    }

    await initEtapesCheck();

}



fetch(`/api/r?r=${encodeURIComponent(r)}`).then(response => response.json()).then(data => {
    recipe = data.recipe;
    ingredients = data.ingredients;
    quantites = ingredients.map(ing => ing.quantity);
    renderRecette(recipe, ingredients);
});