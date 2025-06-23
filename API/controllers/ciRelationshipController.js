import { pool } from '../db.js';

export async function getRelsByCI(req, res) {
  const { ciId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, related_ci_id, relationship_type FROM ci_relationships WHERE ci_id = ?',
      [ciId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener relaciones de CI' });
  }
}

export async function createRel(req, res) {
  const { ciId } = req.params;
  const { related_ci_id, relationship_type } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO ci_relationships (ci_id, related_ci_id, relationship_type)
       VALUES (?, ?, ?)`,
      [ciId, related_ci_id, relationship_type]
    );
    res.status(201).json({
      id: result.insertId,
      ci_id: Number(ciId),
      related_ci_id,
      relationship_type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear relación de CI' });
  }
}

export async function deleteRel(req, res) {
  const { ciId, relId } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM ci_relationships WHERE id = ? AND ci_id = ?',
      [relId, ciId]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Relación no encontrada' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar relación de CI' });
  }
}
