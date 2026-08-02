import {open} from 'sqlite';
import sqlite3 from 'sqlite3';

let dbInstance = null;

export async function initDB() {
    dbInstance = await open({
        filename: 'db/recipes.sqlite',
        driver: sqlite3.Database,
    });
    await dbInstance.exec(`CREATE TABLE IF NOT EXISTS recipes (
            id              INTEGER             PRIMARY KEY AUTOINCREMENT,
            created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
            author          TEXT                NOT NULL DEFAULT 'Auteur inconnu',
            title           TEXT                NOT NULL,
            description     TEXT                NOT NULL DEFAULT 'Aucune description',
            slug            TEXT                NOT NULL UNIQUE,
            image           TEXT                NOT NULL DEFAULT 'default.png',
            category        TEXT                NOT NULL DEFAULT 'Autre',
            price           TEXT,
            prep_time       INTEGER,
            rest_time       INTEGER,
            cook_time       INTEGER,
            note            DECIMAL(2,1),
            servings        INTEGER             NOT NULL,
            servings_unit   TEXT                NOT NULL,
            difficulty      TEXT,
            steps           TEXT[]              NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS ingredients (
            id              INTEGER             PRIMARY KEY AUTOINCREMENT,
            name            TEXT                NOT NULL,
            image           TEXT
        );
        
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
            recipe_id       INTEGER             NOT NULL,
            ingredient_id   INTEGER             NOT NULL,
            quantity        INTEGER             NOT NULL,
            unit            TEXT,
            unit_long       TEXT,
            PRIMARY KEY (recipe_id, ingredient_id)
        )`);
};

export async function getDB() {
    if (!dbInstance) {
        throw new Error("DB non initialisée");
    };
    return dbInstance;
}