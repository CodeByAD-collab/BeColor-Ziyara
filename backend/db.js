const { Pool } = require('pg');
require('dotenv').config(); // Charge les variables du fichier .env

// Crée un pool de connexions.
// Il lira automatiquement la variable d'environnement DATABASE_URL que vous avez mise dans .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requis pour se connecter à Neon depuis un environnement local
    }
});

// Exporte un objet avec une méthode 'query' qui utilise le pool
module.exports = {
    query: (text, params) => pool.query(text, params),
    // Ajout d'une méthode pour fermer le pool, utile pour les scripts
    end: () => pool.end()
};