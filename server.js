import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Límite alto para aceptar las fotos de las películas (base64) en el cuerpo JSON.
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'examenContenedor',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'cine',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  // La comunicación entre Node y MySQL también usa UTF-8 (tildes, ñ, etc.).
  charset: 'utf8mb4',
});

// Asegura que la columna `imagen` exista aunque el contenedor de MySQL ya
// estuviera creado previamente (no recrea ni borra datos existentes).
async function ensureSchema() {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'peliculas' AND COLUMN_NAME = 'imagen'`
  );
  if (cols.length === 0) {
    await pool.query('ALTER TABLE peliculas ADD COLUMN imagen LONGTEXT NULL');
    console.log('Columna `imagen` agregada a la tabla peliculas.');
  }
}

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
    const { titulo, director, anio, genero, imagen } = req.body;
    const [result] = await pool.query(
      'INSERT INTO peliculas (titulo, director, anio, genero, imagen) VALUES (?, ?, ?, ?, ?)',
      [titulo, director, anio, genero, imagen || null]
    );
    const [row] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/peliculas/:id', async (req, res) => {
  try {
    const { titulo, director, anio, genero, imagen } = req.body;
    await pool.query(
      'UPDATE peliculas SET titulo = ?, director = ?, anio = ?, genero = ?, imagen = ? WHERE id = ?',
      [titulo, director, anio, genero, imagen || null, req.params.id]
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

async function start() {
  // Reintenta hasta que MySQL (examenContenedor) esté disponible.
  for (let intento = 1; intento <= 10; intento++) {
    try {
      await ensureSchema();
      break;
    } catch (err) {
      console.log(`Esperando a MySQL (intento ${intento})... ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(port, () => console.log(`App escuchando en puerto ${port}`));
}

start();
