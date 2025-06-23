import { pool } from '../db.js';

export async function getAllEnvs(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM environments ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ambientes' });
  }
}

export async function getEnvById(req, res) {
  const { id } = req.params;
  try {
    const [[env]] = await pool.query('SELECT * FROM environments WHERE id = ?', [id]);
    if (!env) return res.status(404).json({ error: 'Ambiente no encontrado' });
    res.json(env);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ambiente' });
  }
}

export async function createEnv(req, res) {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO environments (name) VALUES (?)',
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear ambiente' });
  }
}

export async function updateEnv(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE environments SET name = ? WHERE id = ?',
      [name, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Ambiente no encontrado' });
    res.json({ id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar ambiente' });
  }
}

export async function deleteEnv(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM environments WHERE id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Ambiente no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar ambiente' });
  }
}
