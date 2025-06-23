jest.mock('../../db.js', () => ({
  pool: { query: jest.fn() }
}));

import { pool } from '../../db.js';
import { getChangesByCI, createChange } from '../../controllers/ciChangeController.js';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ciChangeController', () => {
  describe('getChangesByCI', () => {
    it('debe devolver historial de cambios de un CI', async () => {
      const fakeChanges = [
        { id: 1, ci_id: 5, change_date: '2025-01-01T00:00:00Z', change_description: 'Desc1' },
        { id: 2, ci_id: 5, change_date: '2025-02-01T00:00:00Z', change_description: 'Desc2' }
      ];
      pool.query.mockResolvedValue([ fakeChanges ]);

      const req = { params: { ciId: '5' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getChangesByCI(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM ci_changes WHERE ci_id = ? ORDER BY change_date',
        ['5']
      );
      expect(res.json).toHaveBeenCalledWith(fakeChanges);
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { ciId: '7' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getChangesByCI(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener cambios de CI' });
    });
  });

  describe('createChange', () => {
    it('debe insertar y devolver 201 + nuevo cambio', async () => {
      pool.query.mockResolvedValue([{ insertId: 100 }]);

      const req = {
        params: { ciId: '8' },
        body: {
          change_date: '2025-06-22T12:00:00Z',
          change_description: 'Actualización prueba'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createChange(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        `INSERT INTO ci_changes (ci_id, change_date, change_description)
       VALUES (?, ?, ?)`,
        ['8', '2025-06-22T12:00:00Z', 'Actualización prueba']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 100,
        ci_id: 8,
        change_date: '2025-06-22T12:00:00Z',
        change_description: 'Actualización prueba'
      });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { ciId: '8' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createChange(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear cambio de CI' });
    });
  });
});
