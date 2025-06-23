// controllers/ciChangeController.js
import { pool } from '../db.js';

export async function getChangesByCI(req, res) {
  const { ciId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ci_changes WHERE ci_id = ? ORDER BY change_date',
      [ciId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cambios de CI' });
  }
}

export async function createChange(req, res) {
  const { ciId } = req.params;
  const { change_date, change_description } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO ci_changes (ci_id, change_date, change_description)
       VALUES (?, ?, ?)`,
      [ciId, change_date, change_description]
    );
    res.status(201).json({
      id: result.insertId,
      ci_id: Number(ciId),
      change_date,
      change_description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cambio de CI' });
  }
}
