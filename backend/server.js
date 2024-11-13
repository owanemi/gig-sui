const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');  // Import CORS package

const app = express();
const port = 8080;  // Port set to 8080 as per your original configuration

// Enable CORS for the frontend at localhost:3000
app.use(cors({
  origin: 'http://localhost:3000', // Allow only requests from this origin
}));

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

// Create the users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    walletAddress TEXT
)`);

// Create the jobs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT,
    location TEXT,
    basePay INTEGER,
    description TEXT
)`);

// POST endpoint to add a new user (for login)
app.post('/api/users', (req, res) => {
    const { name, walletAddress } = req.body;

    if (!name || !walletAddress) {
        return res.status(400).json({ error: 'Name and wallet address are required' });
    }

    const stmt = db.prepare(`
        INSERT INTO users (name, walletAddress)
        VALUES (?, ?)
    `);

    stmt.run(name, walletAddress, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to save user data' });
        }
        res.status(200).json({ id: this.lastID, name, walletAddress });
    });

    stmt.finalize();
});

// GET endpoint to fetch all users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(rows);
    });
});

// POST endpoint to add a new job
app.post('/api/jobs', (req, res) => {
    const { title, type, location, basePay, description } = req.body;

    // Check if all data is provided
    if (!title || !type || !location || !basePay || !description) {
        return res.status(400).json({ error: 'All job details are required' });
    }

    const stmt = db.prepare(`
        INSERT INTO jobs (title, type, location, basePay, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(title, type, location, basePay, description, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to post job' });
        }
        res.status(200).json({ id: this.lastID, title, type, location, basePay, description });
    });

    stmt.finalize();
});

// GET endpoint to fetch all jobs
app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM jobs ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch jobs' });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
