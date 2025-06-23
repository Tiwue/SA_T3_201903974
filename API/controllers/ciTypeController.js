// controllers/ciTypeController.js
import { pool } from '../db.js';

export async function getAllTypes(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ci_types ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tipos de CI' });
  }
}

export async function getTypeById(req, res) {
  const { id } = req.params;
  try {
    const [[type]] = await pool.query('SELECT * FROM ci_types WHERE id = ?', [id]);
    if (!type) return res.status(404).json({ error: 'Tipo de CI no encontrado' });
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tipo de CI' });
  }
}

export async function createType(req, res) {
  const { name, description } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO ci_types (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear tipo de CI' });
  }
}

export async function updateType(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE ci_types SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Tipo de CI no encontrado' });
    res.json({ id, name, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tipo de CI' });
  }
}

export async function deleteType(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM ci_types WHERE id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Tipo de CI no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tipo de CI' });
  }
}
