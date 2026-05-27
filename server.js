import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'examenContenedor',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'cine',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get('/api/peliculas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM peliculas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/peliculas/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/peliculas', async (req, res) => {
  try {
    const { titulo, director, anio, genero } = req.body;
    const [result] = await pool.query(
      'INSERT INTO peliculas (titulo, director, anio, genero) VALUES (?, ?, ?, ?)',
      [titulo, director, anio, genero]
    );
    const [row] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/peliculas/:id', async (req, res) => {
  try {
    const { titulo, director, anio, genero } = req.body;
    await pool.query(
      'UPDATE peliculas SET titulo = ?, director = ?, anio = ?, genero = ? WHERE id = ?',
      [titulo, director, anio, genero, req.params.id]
    );
    const [row] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [req.params.id]);
    if (row.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(row[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/peliculas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM peliculas WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App escuchando en puerto ${port}`));
