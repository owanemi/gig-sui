const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 8080;

app.use(cors({
  origin: ['http://localhost:3000', 'https://gig-sui.vercel.app']
}));

const db = new sqlite3.Database(path.join(__dirname, 'jobdb.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'resumes');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'));
        }
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        walletAddress TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        type TEXT,
        location TEXT,
        basePay DECIMAL(10,2),
        description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        wallet_address TEXT,
        resume_path TEXT,
        basePay DECIMAL(10,2),
        application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(job_id) REFERENCES jobs(id)
    )`);
});

// User routes
app.post('/api/users', (req, res) => {
    const { name, walletAddress } = req.body;
    if (!name || !walletAddress) {
        return res.status(400).json({ error: 'Name and wallet address are required' });
    }

    const stmt = db.prepare('INSERT INTO users (name, walletAddress) VALUES (?, ?)');
    stmt.run(name, walletAddress, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to save user data' });
        }
        res.status(200).json({ id: this.lastID, name, walletAddress });
    });
    stmt.finalize();
});

app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(rows);
    });
});

// Job routes
app.post('/api/jobs', (req, res) => {
    const { title, type, location, basePay, description } = req.body;
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

app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM jobs ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch jobs' });
        }
        res.json(rows);
    });
});

// Application routes
app.post('/api/apply', upload.single('resumeFile'), (req, res) => {
    const { jobId, walletAddress } = req.body;
    const resumeFile = req.file;

    // if (!jobId || !walletAddress || !resumeFile) {
    //     return res.status(400).json({ error: 'Job ID, wallet address, and resume are required' });
    // }

    if (!resumeFile || !fs.existsSync(resumeFile.path)) {
        return res.status(500).json({ error: 'Error saving uploaded file' });
    }
    

    db.get('SELECT * FROM jobs WHERE id = ?', [jobId], (err, job) => {
        if (err) {
            return res.status(500).json({ error: 'Error checking job existence' });
        }

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const stats = fs.statSync(resumeFile.path);
        console.log(`Uploaded file size: ${stats.size} bytes`);
    
        if (stats.size === 0) {
            fs.unlinkSync(resumeFile.path); // Delete the corrupted file
            return res.status(500).json({ error: 'Uploaded file is empty' });
        }
    

        const stmt = db.prepare(`
            INSERT INTO job_applications (job_id, wallet_address, resume_path, basePay)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(jobId, walletAddress, path.basename(resumeFile.path), job.basePay, function(err) {
            if (err) {
                console.error('Database insertion error:', err);
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

// Fetch all job applications
// Updated applications route with better error handling
app.get('/api/applications', (req, res) => {
    const query = `
        SELECT 
            ja.id, 
            ja.job_id, 
            ja.wallet_address, 
            ja.resume_path, 
            ja.application_date,
            ja.basePay as base_pay, 
            j.title AS job_title,
            j.type AS job_type,
            j.location AS job_location,
            COALESCE(j.description, '') AS description
        FROM job_applications ja
        LEFT JOIN jobs j ON ja.job_id = j.id
        ORDER BY ja.application_date DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Failed to fetch applications',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        // Add some logging to help debug
        console.log('Successfully fetched applications:', rows.length);
        
        try {
            // Transform the rows to ensure all necessary fields exist
            const safeRows = rows.map(row => ({
                id: row.id,
                job_id: row.job_id,
                wallet_address: row.wallet_address || '',
                resume_path: row.resume_path || '',
                application_date: row.application_date,
                base_pay: row.base_pay || 0,
                job_title: row.job_title || '',
                job_type: row.job_type || '',
                job_location: row.job_location || '',
                description: row.description || ''
            }));

            res.json(safeRows);
        } catch (error) {
            console.error('Error processing rows:', error);
            res.status(500).json({ 
                error: 'Error processing application data',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
});


// Fetch resume by filename
app.get('/api/resume/:filename', (req, res) => {
    const fileName = req.query.fileName;
    const filePath = path.join(__dirname, 'uploads', 'resumes', fileName);

    console.log('File path for download:', filePath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    const fileStream = fs.createReadStream(filePath);

    // Stream the file to the client
    fileStream.on('open', () => {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        fileStream.pipe(res);
    });

    fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).json({ error: 'Failed to stream file' });
    });
});


// Handle applicant payment logic (assuming you want to use the basePay here)
app.post('/api/pay-applicant', async (req, res) => {
    const { jobId, recipientWallet } = req.body;

    if (!jobId || !recipientWallet) {
        return res.status(400).json({ error: 'Job ID and recipient wallet address are required' });
    }

    try {
        // Fetch job details including basePay
        db.get('SELECT * FROM jobs WHERE id = ?', [jobId], async (err, job) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching job details' });
            }

            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const { basePay } = job;

            // Example payment processing logic (replace with actual payment handling)
            console.log(`Processing payment of ${basePay} to ${recipientWallet}`);

            // Here you would integrate your payment gateway logic (e.g., using Sui SDK)

            // Respond with success
            res.status(200).json({ message: 'Payment processed successfully', amount: basePay, recipient: recipientWallet });
        });
    } catch (error) {
        console.error('Error during payment processing:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
