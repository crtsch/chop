async function updateDarkMode() {
    const elements = document.getElementsByTagName('*')
    const dark = localStorage.getItem('dark');
    if (dark == 'l') {
        for(const element of elements) {
            element.classList.remove('dark');
        }
    }
    else if (dark == 'd') {
        for(const element of elements) {
            element.classList.add('dark');
        }
    }
    else {
        console.log('Erreur : le cookie de dark mode n\'a pas une valeur valide');
    }
}



window.addEventListener('load', async (e) => {
    if(!localStorage.getItem('dark')) {
        localStorage.setItem('dark', 'l');
    }
    await updateDarkMode();
})



document.getElementById('darkmode').addEventListener('click', async (e) => {
    const dark = localStorage.getItem('dark');
    if(dark == 'l') {
        localStorage.setItem('dark', 'd');
    }
    else if(dark == 'd') {
        localStorage.setItem('dark', 'l');
    }
    else {
        console.log('Erreur : le cookie de dark mode n\'a pas une valeur valide');
    }
    await updateDarkMode();
})