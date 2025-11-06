const express = require('express');
const cors = require('cors');
// On suppose que votre fichier db.js est configuré pour PostgreSQL comme expliqué précédemment
const db = require('./db.js'); 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES DE L'API (Version PostgreSQL avec async/await) ---

// GET /api/reservations
app.get('/api/reservations', async (req, res) => {
    // Les en-têtes pour le cache sont une bonne pratique, on les garde.
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const sql = "SELECT * FROM reservations ORDER BY dateHeure ASC";
    
    try {
        const result = await db.query(sql);
        // Avec node-postgres (pg), les résultats sont dans la propriété .rows
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erreur [GET /reservations]:", err.message);
        res.status(500).json({ "error": err.message });
    }
});

// POST /api/reservations
app.post('/api/reservations', async (req, res) => {
    const { nomClient, telephone, service, dateHeure, staff, notes } = req.body;
    if (!nomClient || !service || !dateHeure || !staff) {
        return res.status(400).json({ "error": "Les champs nomClient, service, dateHeure et staff sont obligatoires." });
    }

    // On remplace les '?' par $1, $2, etc. et on ajoute "RETURNING *"
    // "RETURNING *" est une commande PostgreSQL qui renvoie la ligne qui vient d'être créée.
    const sql = `
        INSERT INTO reservations (nomClient, telephone, service, dateHeure, staff, notes) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`;
    const params = [nomClient, telephone, service, dateHeure, staff, notes];
    
    try {
        const result = await db.query(sql, params);
        // La nouvelle réservation se trouve dans result.rows[0]
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erreur [POST /reservations]:", err.message);
        res.status(500).json({ "error": err.message });
    }
});

// PUT /api/reservations/:id
app.put('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const { nomClient, telephone, service, dateHeure, staff, notes } = req.body;
    if (!nomClient || !service || !dateHeure || !staff) {
        return res.status(400).json({ "error": "Les champs nomClient, service, dateHeure et staff sont obligatoires." });
    }

    const sql = `
        UPDATE reservations 
        SET nomClient = $1, telephone = $2, service = $3, dateHeure = $4, staff = $5, notes = $6 
        WHERE id = $7
        RETURNING *`; // On renvoie aussi la ligne mise à jour
    const params = [nomClient, telephone, service, dateHeure, staff, notes, id];
    
    try {
        const result = await db.query(sql, params);
        // Si aucune ligne n'a été affectée, la réservation n'existait pas
        if (result.rowCount === 0) {
            return res.status(404).json({ "error": "Réservation non trouvée." });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Erreur [PUT /reservations/${id}]:`, err.message);
        res.status(500).json({ "error": err.message });
    }
});

// DELETE /api/reservations/:id
app.delete('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM reservations WHERE id = $1';
    
    try {
        const result = await db.query(sql, [id]);
        // result.rowCount nous dit combien de lignes ont été supprimées
        if (result.rowCount === 0) {
            return res.status(404).json({ "error": "Réservation non trouvée." });
        }
        res.status(200).json({ message: "Réservation supprimée avec succès" });
    } catch (err) {
        console.error(`Erreur [DELETE /reservations/${id}]:`, err.message);
        res.status(500).json({ "error": err.message });
    }
});

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));