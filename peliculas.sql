-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cine;
USE cine;

-- Crear tabla de películas
CREATE TABLE peliculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    director VARCHAR(100),
    anio INT,
    genero VARCHAR(50)
);

-- Insertar registros de ejemplo
INSERT INTO peliculas (titulo, director, anio, genero) VALUES
('Inception', 'Christopher Nolan', 2010, 'Ciencia ficción'),
('Parasite', 'Bong Joon-ho', 2019, 'Drama'),
('Interstellar', 'Christopher Nolan', 2014, 'Ciencia ficción'),
('The Godfather', 'Francis Ford Coppola', 1972, 'Crimen'),
('Spirited Away', 'Hayao Miyazaki', 2001, 'Animación'),
('The Dark Knight', 'Christopher Nolan', 2008, 'Acción'),
('Pulp Fiction', 'Quentin Tarantino', 1994, 'Crimen'),
('The Shawshank Redemption', 'Frank Darabont', 1994, 'Drama'),
('Fight Club', 'David Fincher', 1999, 'Drama'),
('Forrest Gump', 'Robert Zemeckis', 1994, 'Drama'),
('The Matrix', 'Lana y Lilly Wachowski', 1999, 'Ciencia ficción'),
('City of God', 'Fernando Meirelles', 2002, 'Crimen'),
('La La Land', 'Damien Chazelle', 2016, 'Musical'),
('Gladiator', 'Ridley Scott', 2000, 'Acción'),
('Titanic', 'James Cameron', 1997, 'Romance');
