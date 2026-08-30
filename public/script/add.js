const ingList = document.getElementById('ingredients-liste');
const etapesList = document.getElementById('etapes-liste');

async function addIngredient(ing, qte, unite) {
    const ingredientDiv = document.createElement('div');
    ingredientDiv.classList.add('ingredient');
    ingredientDiv.innerHTML = ` <img class="ingredient-photo" src="/assets/${ing ? 'ingredients/' + ing.image : 'icones/plus.svg'}">
                                <input type="text" class="ingredient-nom" ${ing ? 'value="' + ing.name + '"' : ''}>
                                <input type="number" class="ingredient-quantite" ${qte? 'value="' + qte + '"' : ''}>
                                <input type="text" class="ingredient-unite" ${unite ? 'value="' + unite + '"' : ''}>`;
    ingList.appendChild(ingredientDiv);
}

async function updateEtapesNumbers() {
    var i = 1;
    Array.from(document.getElementsByClassName('etape')).forEach((etape) => {
        etape.querySelector('.etape-num').innerText = i;
        i++;
    })
}

async function addEtape() {
    const etapeDiv = document.createElement('div');
    etapeDiv.classList.add('etape');
    etapeDiv.innerHTML = ` <p class="etape-num">${etapesList.children.length + 1}</p>
                           <input type="text" class="etape-desc">
                           <button class="etape-suppr">X</button>`;
    etapesList.appendChild(etapeDiv);
    const bouton = etapeDiv.querySelector('.etape-suppr');
    bouton.addEventListener('click', () => {bouton.parentElement.remove(); updateEtapesNumbers();})
}

document.getElementById('ajouter-ingredient').addEventListener('click', () => {addIngredient()});

document.getElementById('ajouter-etape').addEventListener('click', () => {addEtape()});

Array.from(document.getElementsByClassName('etape-suppr')).forEach((bouton) => {
    bouton.addEventListener('click', () => {bouton.parentElement.remove(); updateEtapesNumbers();})
});