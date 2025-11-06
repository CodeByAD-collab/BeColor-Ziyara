const db = require('./db');

async function createTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        nomClient TEXT NOT NULL,
        telephone TEXT,
        categorie TEXT,
        service TEXT NOT NULL,
        dateHeure TIMESTAMP WITH TIME ZONE NOT NULL,
        staff TEXT,
        notes TEXT
    );
    `;

    try {
        await db.query(createTableQuery);
        console.log("✅ Table 'reservations' créée ou déjà existante sur Neon.");
    } catch (err) {
        console.error("❌ Erreur lors de la création de la table:", err.stack);
    } finally {
        // Très important : fermer la connexion pour que le script se termine
        await db.end();
        console.log("Connexion à la base de données fermée.");
    }
}

createTable();