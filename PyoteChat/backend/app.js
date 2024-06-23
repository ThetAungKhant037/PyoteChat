// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Import fs module for file operations

// Initialize express app
const app = express();

// Middleware setup
app.use(bodyParser.json()); // Parse incoming JSON payloads
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files statically
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Serve static files from 'frontend' directory

// MySQL database connection setup
const connection = mysql.createConnection({
    host: 'localhost', // Replace with your MySQL host
    user: 'root', // Replace with your MySQL username
    password: 'root', // Replace with your MySQL password
    database: 'image_text_board' // Replace with your MySQL database name
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

// Delete a post
app.delete('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;

    // First, retrieve image_path from database
    connection.query('SELECT image_path FROM posts WHERE id = ?', [postId], (err, results) => {
        if (err) {
            console.error('Error fetching image path:', err);
            res.status(500).send('Error fetching image path');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Post not found');
            return;
        }

        const imagePath = results[0].image_path;

        // Delete record from database
        connection.query('DELETE FROM posts WHERE id = ?', [postId], (err, result) => {
            if (err) {
                console.error('Error deleting post:', err);
                res.status(500).send('Error deleting post');
                return;
            }

            // Delete file from server
            fs.unlink(path.join(__dirname, 'uploads', imagePath), (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    // Handle error
                    res.status(500).send('Error deleting file');
                    return;
                }

                console.log('File deleted successfully');
                res.status(200).json({ message: 'Post and file deleted successfully' });
            });
        });
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
