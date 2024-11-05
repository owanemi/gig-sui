const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the respective directories
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/landing', express.static(path.join(__dirname, 'landing')));

// Route to serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Route to serve the landing page
app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing', 'landingPage.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
