import express from 'express';
import {initDB, getDB} from './db.js';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

await initDB();


//////////////////////////////////////////////////


app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'home.html'));
});

app.get('/r', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'recipe.html'));
})

app.get('/todo', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'todo.html'));
})

app.get('/api/r', async (req, res) => {
    const slug = req.query.r;

    if (!slug) {
        return res.status(400).json({ error: 'Slug manquant' });
    }

    const db = await getDB();
    const recipe = await db.get(`SELECT * FROM recipes WHERE slug = ?`, [slug]);

    if (!recipe) {
        return res.status(404).json({ error: 'Recette introuvable' });
    }

    const ingredients = await db.all(
        `SELECT i.id, i.name, i.image, ri.quantity, ri.unit
         FROM recipe_ingredients ri
         JOIN ingredients i ON i.id = ri.ingredient_id
         WHERE ri.recipe_id = ?`,
        [recipe.id]
    );

    return res.status(200).json({ recipe, ingredients });
})

app.get('/recipes', async (req, res) => {
    const db = await getDB();
    const recettes = await db.all(`SELECT * FROM recipes`);
    return res.status(200).json(recettes);
})

app.get('/ingredients', async (req, res) => {
    const db = await getDB();
    const ingredients = await db.all(`SELECT * FROM ingredients`);
    return res.status(200).json(ingredients);
})

app.get('/recipe_ingredients', async (req, res) => {
    const db = await getDB();
    const recetteIngredients = await db.all(`SELECT * FROM recipe_ingredients`);
    return res.status(200).json(recetteIngredients);
})


app.listen(port, () => {
    console.log(`Serveur lancé, port ${port}`)
})