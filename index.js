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

app.get('/recette', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'recipe.html'));
})


app.listen(port, () => {
    console.log(`Serveur lancé, port ${port}`)
})