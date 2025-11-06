const express = require('express');
const cors = require('cors');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES DE L'API ---

// GET /api/reservations (inchangé)
app.get('/api/reservations', (req, res) => {
    // ✅ CORRECTION : Ajout des en-têtes pour empêcher le navigateur de mettre la réponse en cache.
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Pour les navigateurs modernes
    res.setHeader('Pragma', 'no-cache'); // Pour la compatibilité avec les anciens navigateurs/proxys
    res.setHeader('Expires', '0'); // Pour les proxys

    const sql = "SELECT * FROM reservations ORDER BY dateHeure ASC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// POST /api/reservations (mis à jour)
app.post('/api/reservations', (req, res) => {
    const { nomClient, telephone, service, dateHeure, staff, notes } = req.body;
    if (!nomClient || !service || !dateHeure || !staff) {
        return res.status(400).json({ "error": "Les champs nomClient, service, dateHeure et staff sont obligatoires." });
    }
    const sql = 'INSERT INTO reservations (nomClient, telephone, service, dateHeure, staff, notes) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [nomClient, telephone, service, dateHeure, staff, notes];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// PUT /api/reservations/:id (NOUVEAU)
app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const { nomClient, telephone, service, dateHeure, staff, notes } = req.body;
    if (!nomClient || !service || !dateHeure || !staff) {
        return res.status(400).json({ "error": "Les champs nomClient, service, dateHeure et staff sont obligatoires." });
    }
    const sql = `
        UPDATE reservations 
        SET nomClient = ?, telephone = ?, service = ?, dateHeure = ?, staff = ?, notes = ? 
        WHERE id = ?`;
    const params = [nomClient, telephone, service, dateHeure, staff, notes, id];
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ "error": err.message });
        }
        res.status(200).json({ message: "Réservation mise à jour", ...req.body });
    });
});

// DELETE /api/reservations/:id (NOUVEAU)
app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM reservations WHERE id = ?', id, function(err) {
        if (err) {
            return res.status(500).json({ "error": err.message });
        }
        res.status(200).json({ message: "Réservation supprimée", changes: this.changes });
    });
});


app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));