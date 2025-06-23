jest.mock('../../db.js', () => ({
  pool: { query: jest.fn() }
}));

import { pool } from '../../db.js';
import {
  getAllCIs,
  getCIById,
  createCI,
  updateCI,
  deleteCI
} from '../../controllers/ciController.js';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ciController', () => {
  describe('getAllCIs', () => {
    it('debe devolver lista de CIs', async () => {
      const fakeRows = [{ id: 1, name: 'CI1' }, { id: 2, name: 'CI2' }];
      pool.query.mockResolvedValue([ fakeRows ]);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getAllCIs(req, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain('FROM cis c');
      expect(res.json).toHaveBeenCalledWith(fakeRows);
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getAllCIs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener CIs' });
    });
  });

  describe('getCIById', () => {
    it('debe devolver CI existente', async () => {
      const fakeCI = { id: 5, name: 'CI5' };
      pool.query.mockResolvedValue([[ fakeCI ]]);

      const req = { params: { id: '5' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getCIById(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM cis WHERE id = ?', ['5']
      );
      expect(res.json).toHaveBeenCalledWith(fakeCI);
    });

    it('debe devolver 404 si no existe', async () => {
      pool.query.mockResolvedValue([[]]);

      const req = { params: { id: '99' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getCIById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'CI no encontrado' });
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getCIById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener CI' });
    });
  });

  describe('createCI', () => {
    it('debe insertar y devolver 201 + nuevo CI', async () => {
      pool.query.mockResolvedValue([{ insertId: 42 }]);

      const req = {
        body: {
          name: 'NewCI', type_id: 1, description: 'desc', serial_number: 'SN',
          version: 'v1', acquisition_date: '2025-01-01', status: 'Activo',
          location: 'Loc', owner: 'Owner', documentation_url: '',
          incident_url: '', security_level: 'Medio', compliance: '',
          config_state: '', license_number: '', license_expiration_date: '',
          environment_id: 2
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createCI(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cis'),
        expect.any(Array)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 42, ...req.body });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createCI(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear CI' });
    });
  });

  describe('updateCI', () => {
    it('debe actualizar y devolver objeto actualizado', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = {
        params: { id: '5' },
        body:   { status: 'Inactivo', owner: 'NewOwner' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateCI(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cis SET'),
        expect.arrayContaining(['Inactivo', 'NewOwner', '5'])
      );
      expect(res.json).toHaveBeenCalledWith({ id: '5', ...req.body });
    });

    it('devuelve 404 si nada actualizado', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const req = { params: { id: '10' }, body: { field: 'val' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateCI(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'CI no encontrado' });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' }, body: { any: 'value' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateCI(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar CI' });
    });
  });

  describe('deleteCI', () => {
    it('debe borrar y devolver 204', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = { params: { id: '3' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteCI(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM cis WHERE id = ?', ['3']
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('devuelve 404 si nada borrado', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const req = { params: { id: '8' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteCI(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'CI no encontrado' });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteCI(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al eliminar CI' });
    });
  });
});
