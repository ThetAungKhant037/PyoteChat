CREATE DATABASE IF NOT EXISTS image_text_board;

USE image_text_board;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);
