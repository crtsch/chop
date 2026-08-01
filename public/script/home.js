const recettesContainer = document.getElementById('liste');

async function recetteSynthese(r) {
    var res = `${r.category}`;
    if (r.difficulty) {
        res += ` • ${r.difficulty}`;
    }
    if (r.price) {
        res += ` • ${r.price}`;
    }
    if (r.prep_time) {
        res += ` • ${r.prep_time} min`;
    }
    return res;
};

async function putNote(r) {
    if (r.note) {
        return `<span class="recette-note">&#9733; ${r.note}/5</span>`;
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

async function updateRecettes() {
    const response = await fetch('/recipes');
    const recettes = await response.json();
    recettesContainer.innerHTML = '';
    if (recettes.length == 0) {
        recettesContainer.innerHTML = '<p><i>Aucune recette</i></p>';
    }
    else {
        for(const recette of recettes) {
            recettesContainer.appendChild(await creerCarte(recette));
        }
    }
};





document.addEventListener('DOMContentLoaded', (e) => {
    updateRecettes();
})