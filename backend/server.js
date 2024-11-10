const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Create and connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'jobdb.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (frontend HTML, JS, CSS, etc.)
app.use(express.static(path.join(__dirname, '../frontend')));

// Create the jobs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT,
    location TEXT,
    salaryMin INTEGER,
    salaryMax INTEGER,
    description TEXT
)`);

// POST endpoint to add a new job
app.post('/api/jobs', (req, res) => {
    const { title, type, location, salaryMin, salaryMax, description } = req.body;

    const stmt = db.prepare(`
        INSERT INTO jobs (title, type, location, salaryMin, salaryMax, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(title, type, location, salaryMin, salaryMax, description, function(err) {
        if (err) {
            res.status(500).json({ error: 'Failed to post job' });
            return;
        }
        res.status(200).json({ id: this.lastID });
    });

    stmt.finalize();
});

// GET endpoint to fetch all jobs
app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM jobs ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch jobs' });
            return;
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
