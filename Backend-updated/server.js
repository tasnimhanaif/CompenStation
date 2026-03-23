const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Aiven MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Fixes the self-signed certificate error
    }
});

db.connect(err => {
    if (err) console.error("❌ Database Error:", err.message);
    else console.log("✅ Connected to Aiven MySQL!");
});

// GET all employees
app.get('/employees', (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST new employee
app.post('/employees', (req, res) => {
    const { fullName, email, hourlyRate, jobTitle } = req.body;
    const query = 'INSERT INTO employees (fullName, email, hourlyRate, jobTitle) VALUES (?, ?, ?, ?)';
    db.query(query, [fullName, email, hourlyRate, jobTitle], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// DELETE employee
app.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employees WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.sendStatus(204);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server live at http://localhost:${PORT}`));