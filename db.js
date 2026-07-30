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
            title           TEXT                NOT NULL,
            description     TEXT,
            slug            TEXT                NOT NULL UNIQUE,
            image           TEXT                NOT NULL DEFAULT 'default.png',
            category        TEXT                NOT NULL DEFAULT 'autre',
            prep_time       INTEGER,
            rest_time       INTEGER,
            cook_time       INTEGER,
            note            DECIMAL(2,1),
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
            unit            TEXT                NOT NULL DEFAULT '',
            PRIMARY KEY (recipe_id, ingredient_id)
        )`);
};

export async function getDB() {
    if (!dbInstance) {
        throw new Error("DB non initialisée");
    };
    return dbInstance;
}