let recipeTitle = "";

// Etape faite

async function initEtapesCheck() {
    const etapes = document.getElementsByClassName('etape');
    Array.from(etapes).forEach((etape) => {
        etape.addEventListener('click', (e) => {
            if(etape.classList.contains('etape-verte')) {
                etape.classList.remove('etape-verte');
            }
            else {
                etape.classList.add('etape-verte');
            }
        })
    })
}


// Ingrédient check

async function initIngredientCheck() {
    const ingredientsListe = document.getElementsByClassName('ingredient');
    Array.from(ingredientsListe).forEach((ingredient) => {
        ingredient.addEventListener('click', (e) => {
            if(ingredient.classList.contains('etape-verte')) {
                ingredient.classList.remove('etape-verte');
            }
            else {
                ingredient.classList.add('etape-verte');
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
let baseServings = 0;
let recetteEtapes = [];

const ingredientsContainer = document.getElementById('ingredients');
const etapesContainer = document.getElementById('etapes');
const image = document.getElementById('image');
const infos = document.getElementById('infos');


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
    ingredientQuantite.innerText = `${ingredient.quantity} ${ingredient.unit}`;
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
    
    image.style.background = `linear-gradient(rgba(var(--accent), 0.1) 50%, rgba(var(--accent), 0.6) 100%),
                      linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.5)) 100%,
                      url(../assets/recettes-cover/${recipe.image})`;
    image.querySelector('h1').innerText = recipe.title;
    document.getElementById('auteur').innerText = recipe.author;

    document.getElementById('description-texte').innerText = recipe.description;

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
    if(recipe.note) {
        time += `
            <div class="info">
                <img src="assets/icones/etoile_rose.svg" alt="⭐">
                <span>${recipe.note}/5</span>
            </div>`;
    };
    time += '</div>';
    infos.innerHTML += time;

    baseServings = recipe.servings;
    document.getElementById('quantity-val').innerText = `${recipe.servings} ${recipe.servings_unit}`;


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



// Modifier les quantités

async function updateQuantites() {
    const ingredientsListe = document.getElementsByClassName('ingredient');
    const currentServings = document.getElementById('quantity-val').innerText.split(' ')[0];
    Array.from(ingredientsListe).forEach((ingredient, index) => {
        const ingredientQuantite = ingredient.querySelector('.ingredient-quantite');
        ingredientQuantite.innerText = `${(currentServings / baseServings) * ingredients[index].quantity} ${ingredients[index].unit}`;
    });
}


// Popup de partage

document.getElementById('share-url').value = window.location.href;

document.getElementById('partager-btn').addEventListener('click', (e) => {
    document.getElementById('share-modal-container').style.display ='flex';
})

document.getElementById('close-btn').addEventListener('click', (e) => {
    document.getElementById('share-modal-container').style.display ='none';
})

document.getElementById('share-url-btn').addEventListener('click', (e) => {
    navigator.clipboard.writeText(window.location.href);
    document.getElementById('share-modal-container').style.display ='none';
})

document.getElementById('mail-btn').addEventListener('click', (e) => {
    window.open(`mailto:?subject=Recette%20Chop%20${recipeTitle}&body=Regarde%20cette%20recette%20trouv%C3%A9e%20sur%20Chop%20%3A%20${recipeTitle}%20${window.location.href}%20!`, '_blank').focus();
    document.getElementById('share-modal-container').style.display ='none';
});

document.getElementById('whatsapp-btn').addEventListener('click', (e) => {
    window.open(`https://api.whatsapp.com/send/?text=${window.location.href}&type=custom_url&app_absent=0`, '_blank').focus();
    document.getElementById('share-modal-container').style.display ='none';
})

document.getElementById('pinterest-btn').addEventListener('click', (e) => {
    window.open(`https://fr.pinterest.com/pin/create/button/?url=${window.location.href}&description=${recipeTitle}&is_video=true&media=${window.getComputedStyle(document.getElementById('image'), false).backgroundImage.slice(4, -1).replace(/"/g, "").split(', url(')[1]}`, '_blank').focus();
    document.getElementById('share-modal-container').style.display ='none';
})



// Fetch et events


fetch(`/api/r?r=${encodeURIComponent(r)}`)
    .then(response => response.json())
    .then(async (data) => {
        recipe = data.recipe;
        ingredients = data.ingredients;
        recipeTitle = recipe.title;
        await renderRecette(recipe, ingredients);
        await updateDarkMode();
    });


document.getElementById('quantity-moins').addEventListener('click', async () => {
    const quantityVal = document.getElementById('quantity-val');
    const quantitesTexte = quantityVal.innerText.split(' ');
    if(quantitesTexte[0] > 1) {
        quantityVal.innerText = `${parseInt(quantitesTexte[0]) - 1} ${quantitesTexte[1]}`;
    }
    await updateQuantites();
});

document.getElementById('quantity-plus').addEventListener('click', async () => {
    const quantityVal = document.getElementById('quantity-val');
    const quantitesTexte = quantityVal.innerText.split(' ');
    quantityVal.innerText = `${parseInt(quantitesTexte[0]) + 1} ${quantitesTexte[1]}`;
    await updateQuantites();
});