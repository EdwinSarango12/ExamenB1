import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'examenContenedor',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'cine',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  charset: 'utf8mb4',
});


function fixMojibake(s) {
  if (s == null) return { changed: false, value: s };
  const decoded = Buffer.from(s, 'latin1').toString('utf8');
  if (decoded.includes('�')) return { changed: false, value: s }; 
  const reencoded = Buffer.from(decoded, 'utf8').toString('latin1');
  if (reencoded === s && decoded !== s) return { changed: true, value: decoded };
  return { changed: false, value: s };
}

const cols = ['titulo', 'director', 'genero'];
const [rows] = await conn.query('SELECT id, titulo, director, genero FROM peliculas');

let fixedRows = 0;
for (const row of rows) {
  const updates = {};
  for (const c of cols) {
    const r = fixMojibake(row[c]);
    if (r.changed) updates[c] = r.value;
  }
  if (Object.keys(updates).length) {
    const set = Object.keys(updates).map((c) => `${c} = ?`).join(', ');
    await conn.query(`UPDATE peliculas SET ${set} WHERE id = ?`, [...Object.values(updates), row.id]);
    fixedRows++;
    console.log(` id ${row.id} reparado:`, updates);
  }
}

console.log(`Listo. Filas reparadas: ${fixedRows} de ${rows.length}.`);
await conn.end();
