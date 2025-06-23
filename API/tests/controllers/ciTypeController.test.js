jest.mock('../../db.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

import { pool } from '../../db.js';
import {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType
} from '../../controllers/ciTypeController.js';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ciTypeController', () => {
  describe('getAllTypes', () => {
    it('debe devolver lista de tipos', async () => {
      const fakeRows = [{ id: 1, name: 'A', description: 'desc' }];
      pool.query.mockResolvedValue([ fakeRows ]);

      const req = {}; 
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getAllTypes(req, res);

      expect(pool.query)
        .toHaveBeenCalledWith('SELECT * FROM ci_types ORDER BY id');
      expect(res.json).toHaveBeenCalledWith(fakeRows);
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getAllTypes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener tipos de CI'
      });
    });
  });

  describe('getTypeById', () => {
    it('debe devolver tipo existente', async () => {
      const fakeType = { id: 2, name: 'B', description: 'descB' };
      pool.query.mockResolvedValue([[ fakeType ]]);

      const req = { params: { id: '2' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getTypeById(req, res);

      expect(pool.query)
        .toHaveBeenCalledWith('SELECT * FROM ci_types WHERE id = ?', ['2']);
      expect(res.json).toHaveBeenCalledWith(fakeType);
    });

    it('debe devolver 404 si no existe', async () => {
      pool.query.mockResolvedValue([[]]);

      const req = { params: { id: '999' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getTypeById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tipo de CI no encontrado'
      });
    });

    it('mapea errores a 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getTypeById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener tipo de CI'
      });
    });
  });

  describe('createType', () => {
    it('debe insertar y devolver 201 + nuevo objeto', async () => {
      pool.query.mockResolvedValue([{ insertId: 42 }]);

      const req = {
        body: { name: 'Nuevo', description: 'DescNuevo' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createType(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO ci_types (name, description) VALUES (?, ?)',
        ['Nuevo', 'DescNuevo']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 42,
        name: 'Nuevo',
        description: 'DescNuevo'
      });
    });

    it('mapea error a 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createType(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al crear tipo de CI'
      });
    });
  });

  describe('updateType', () => {
    it('debe actualizar y devolver 200 + objeto', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = {
        params: { id: '5' },
        body:   { name: 'X', description: 'Y' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateType(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE ci_types SET name = ?, description = ? WHERE id = ?',
        ['X', 'Y', '5']
      );
      expect(res.json).toHaveBeenCalledWith({
        id: '5',
        name: 'X',
        description: 'Y'
      });
    });

    it('devuelve 404 si affectedRows = 0', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const req = { params: { id: '9' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateType(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tipo de CI no encontrado'
      });
    });

    it('mapea error a 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await updateType(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al actualizar tipo de CI'
      });
    });
  });

  describe('deleteType', () => {
    it('debe borrar y devolver 204', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = { params: { id: '3' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteType(req, res);

      expect(pool.query)
        .toHaveBeenCalledWith('DELETE FROM ci_types WHERE id = ?', ['3']);
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

      await deleteType(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tipo de CI no encontrado'
      });
    });

    it('mapea error a 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteType(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al eliminar tipo de CI'
      });
    });
  });
});
