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
        `SELECT i.id, i.name, i.image, ri.quantity, ri.unit, ri.unit_long
         FROM recipe_ingredients ri
         JOIN ingredients i ON i.id = ri.ingredient_id
         WHERE ri.recipe_id = ?`,
        [recipe.id]
    );

    return res.status(200).json({ recipe, ingredients });
})

app.get('/recipes', async (req, res) => {
    try {
        const db = await getDB();
        let sql = 'SELECT * FROM recipes';
        let params = [];
        
        const title = req.query.title;              // OK
        const authors = req.query.authors;            // --
        const category = req.query.category;        // OK
        const maxprice = req.query.maxprice;        // --
        const prep_time = req.query.prep_time;      // --
        const note = req.query.note;                // OK
        const difficulty = req.query.difficulty;    // --
        const ingredients = req.query.ingredients;  // OK

        if (title) {
            sql += ' WHERE title LIKE ?';
            params.push(`%${title}%`);
        }

        if (authors) {
            const authorList = authors.split(',').map(a => a.trim());
            if (authorList.length > 0) {
                const placeholders = authorList.map(() => '?').join(', ');
                sql += (params.length ? ' AND ' : ' WHERE ') + `author IN (${placeholders})`;
                params.push(...authorList);
            }
        }

        if (category) {
            sql += (params.length ? ' AND ' : ' WHERE ') + 'category = ?';
            params.push(category);
        }

        if (maxprice) {
            sql += (params.length ? ' AND ' : ' WHERE ') + 'price <= ?';
            params.push(maxprice);
        }

        if (prep_time) {
            sql += (params.length ? ' AND ' : ' WHERE ') + 'prep_time <= ?';
            params.push(prep_time);
        }

        if (note) {
            sql += (params.length ? ' AND ' : ' WHERE ') + 'note >= ?';
            params.push(note);
        }

        if (difficulty) {
            sql += (params.length ? ' AND ' : ' WHERE ') + 'difficulty = ?';
            params.push(difficulty);
        }

        if (ingredients) {
            const ingredientIds = ingredients.split(',').map(id => parseInt(id));

            if (ingredientIds.length > 0) {
                
                const placeholders = ingredientIds.map(() => '?').join(', ');

                sql += (params.length ? ' AND ' : ' WHERE ') + `
                    id IN (
                        SELECT recipe_id
                        FROM recipe_ingredients 
                        WHERE ingredient_id IN (${placeholders})
                        GROUP BY recipe_id
                        HAVING COUNT(DISTINCT ingredient_id) = ?
                    )
                `;

                for (let i = 0; i < ingredientIds.length; i++) {
                    params.push(ingredientIds[i]);
                }
                
                params.push(ingredientIds.length);
            }
        }

        const rows = await db.all(sql, params);
        res.json(rows);

    } catch (err) {
        console.error("Erreur SQL :", err.message);
        res.status(500).json({ error: err.message });
    }
});

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