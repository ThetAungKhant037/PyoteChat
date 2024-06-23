const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

// MySQL connection
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

// Route to create a new post
router.post('/posts', upload.single('image'), (req, res) => {
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

// Route to get all posts
router.get('/posts', (req, res) => {
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

// Route to delete a post by ID
router.delete('/posts/:postId', (req, res) => {
    const postId = req.params.postId;

    const query = 'DELETE FROM posts WHERE id = ?';
    connection.query(query, [postId], (err, result) => {
        if (err) {
            console.error('Error deleting post: ' + err);
            res.status(500).send('Error deleting post');
            return;
        }
        res.status(200).json({ message: 'Post deleted' });
    });
});

module.exports = router;
