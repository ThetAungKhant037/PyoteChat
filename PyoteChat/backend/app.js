// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();

// Middleware setup
app.use(bodyParser.json()); // Parse incoming JSON payloads
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files statically
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Serve static files from 'frontend' directory

// MySQL database connection setup
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as ID: ' + connection.threadId);
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // File upload destination directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // File name on server
    }
});

const upload = multer({ storage: storage });

// Example API routes
// Create a new post
app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const imagePath = req.file.path;

    const query = 'INSERT INTO posts (title, image_path, content) VALUES (?, ?, ?)';
    connection.query(query, [title, imagePath, content], (err, result) => {
        if (err) {
            console.error('Error inserting post: ' + err);
            res.status(500).send('Error inserting post');
            return;
        }
        res.status(201).json({ message: 'Post created', postId: result.insertId });
    });
});

// Fetch all posts
app.get('/api/posts', (req, res) => {
    const query = 'SELECT * FROM posts';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching posts: ' + err);
            res.status(500).send('Error fetching posts');
            return;
        }
        res.status(200).json(results);
    });
});

// Serve index.html for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000; // Use environment port or 3000 if not set
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
