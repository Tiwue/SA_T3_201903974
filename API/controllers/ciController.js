// controllers/ciController.js
import { pool } from '../db.js';

export async function getAllCIs(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, t.name     AS type, 
                     e.name AS environment
      FROM cis c
      JOIN ci_types t  ON c.type_id = t.id
      JOIN environments e ON c.environment_id = e.id
      ORDER BY c.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener CIs' });
  }
}

export async function getCIById(req, res) {
  const { id } = req.params;
  try {
    const [[ci]] = await pool.query(`SELECT * FROM cis WHERE id = ?`, [id]);
    if (!ci) return res.status(404).json({ error: 'CI no encontrado' });
    res.json(ci);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener CI' });
  }
}

export async function createCI(req, res) {
  const {
    name, type_id, description, serial_number, version,
    acquisition_date, status, location, owner,
    documentation_url, incident_url,
    security_level, compliance, config_state,
    license_number, license_expiration_date,
    environment_id
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO cis
        (name,type_id,description,serial_number,version,
         acquisition_date,status,location,owner,
         documentation_url,incident_url,
         security_level,compliance,config_state,
         license_number,license_expiration_date,environment_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name, type_id, description, serial_number, version,
        acquisition_date, status, location, owner,
        documentation_url, incident_url,
        security_level, compliance, config_state,
        license_number, license_expiration_date, environment_id
      ]
    );
    const newCI = { id: result.insertId, ...req.body };
    res.status(201).json(newCI);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear CI' });
  }
}

export async function updateCI(req, res) {
  const { id } = req.params;
  const fields = Object.keys(req.body)
    .map(f => `${f} = ?`)
    .join(',');
  const values = Object.values(req.body);

  try {
    const [result] = await pool.query(
      `UPDATE cis SET ${fields} WHERE id = ?`,
      [...values, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'CI no encontrado' });
    res.json({ id, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar CI' });
  }
}

export async function deleteCI(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM cis WHERE id = ?`, [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'CI no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar CI' });
  }
}
