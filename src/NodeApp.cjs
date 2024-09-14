const express = require('express');
const path = require('path');
const { stdout } = require('process');

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'dist')));

// Render the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

