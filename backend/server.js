const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // Add multer for file uploads
const fs = require('fs');

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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'resumes');
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        cb(null, `application_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only certain file types
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'));
        }
    }
});

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

// Create the job_applications table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    wallet_address TEXT,
    resume_path TEXT,
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id)
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

// NEW ENDPOINT: Job Application Submission
app.post('/api/apply', upload.single('resumeFile'), (req, res) => {
    const { jobId, walletAddress } = req.body;
    const resumeFile = req.file;

    // Validate input
    if (!jobId || !walletAddress || !resumeFile) {
        return res.status(400).json({ error: 'Job ID, wallet address, and resume are required' });
    }

    // Check if the job exists
    db.get('SELECT * FROM jobs WHERE id = ?', [jobId], (err, job) => {
        if (err) {
            return res.status(500).json({ error: 'Error checking job existence' });
        }

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Insert application into database
        const stmt = db.prepare(`
            INSERT INTO job_applications (job_id, wallet_address, resume_path)
            VALUES (?, ?, ?)
        `);

        stmt.run(jobId, walletAddress, resumeFile.path, function(err) {
            if (err) {
                // If insertion fails, delete the uploaded file
                fs.unlinkSync(resumeFile.path);
                return res.status(500).json({ error: 'Failed to save application' });
            }

            res.status(200).json({ 
                message: 'Application submitted successfully',
                applicationId: this.lastID 
            });
        });

        stmt.finalize();
    });
});

// NEW ENDPOINT: Fetch Job Applications (for admin/employer use)
app.get('/api/applications', (req, res) => {
    db.all(`
        SELECT 
            ja.id, 
            ja.job_id, 
            ja.wallet_address, 
            ja.resume_path, 
            ja.application_date,
            j.title AS job_title
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        ORDER BY ja.application_date DESC
    `, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch applications' });
        }
        res.json(rows);
    });
});

// Serve uploaded resumes (optional, for admin preview)
app.get('/uploads/resumes/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'resumes', req.params.filename);
    res.download(filePath);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});