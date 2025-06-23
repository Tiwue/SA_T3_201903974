jest.mock('../../db.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

import { pool } from '../../db.js';
import {
  getAllEnvs,
  getEnvById,
  createEnv,
  updateEnv,
  deleteEnv
} from '../../controllers/enviromentControler.js';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('environmentController', () => {

  describe('getAllEnvs', () => {
    it('debe devolver lista de ambientes', async () => {
      const fakeRows = [{ id: 1, name: 'DEV' }, { id: 2, name: 'QA' }];
      pool.query.mockResolvedValue([ fakeRows ]);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getAllEnvs(req, res);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM environments ORDER BY id');
      expect(res.json).toHaveBeenCalledWith(fakeRows);
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getAllEnvs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener ambientes' });
    });
  });

  describe('getEnvById', () => {
    it('debe devolver ambiente existente', async () => {
      const fakeEnv = { id: 2, name: 'QA' };
      pool.query.mockResolvedValue([[ fakeEnv ]]);

      const req = { params: { id: '2' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getEnvById(req, res);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM environments WHERE id = ?', ['2']);
      expect(res.json).toHaveBeenCalledWith(fakeEnv);
    });

    it('debe devolver 404 si no existe', async () => {
      pool.query.mockResolvedValue([[]]);

      const req = { params: { id: '99' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getEnvById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ambiente no encontrado' });
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getEnvById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener ambiente' });
    });
  });

  describe('createEnv', () => {
    it('debe insertar y devolver 201 + nuevo ambiente', async () => {
      pool.query.mockResolvedValue([{ insertId: 10 }]);

      const req = { body: { name: 'STAGING' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createEnv(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO environments (name) VALUES (?)',
        ['STAGING']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 10, name: 'STAGING' });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { body: { name: '' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createEnv(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear ambiente' });
    });
  });

  describe('updateEnv', () => {
    it('debe actualizar y devolver objeto actualizado', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = {
        params: { id: '5' },
        body:   { name: 'PREPROD' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateEnv(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE environments SET name = ? WHERE id = ?',
        ['PREPROD', '5']
      );
      expect(res.json).toHaveBeenCalledWith({ id: '5', name: 'PREPROD' });
    });

    it('devuelve 404 si nothing updated', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const req = { params: { id: '99' }, body: { name: 'XYZ' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateEnv(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ambiente no encontrado' });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' }, body: { name: 'ANY' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateEnv(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar ambiente' });
    });
  });

  describe('deleteEnv', () => {
    it('debe borrar y devolver 204', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = { params: { id: '3' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteEnv(req, res);

      expect(pool.query)
        .toHaveBeenCalledWith('DELETE FROM environments WHERE id = ?', ['3']);
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

      await deleteEnv(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ambiente no encontrado' });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteEnv(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al eliminar ambiente' });
    });
  });
});
