jest.mock('../../db.js', () => ({
  pool: { query: jest.fn() }
}));

import { pool } from '../../db.js';
import {
  getRelsByCI,
  createRel,
  deleteRel
} from '../../controllers/ciRelationshipController.js';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ciRelationshipController', () => {
  describe('getRelsByCI', () => {
    it('debe devolver lista de relaciones para un CI', async () => {
      const fakeRels = [
        { id: 1, related_ci_id: 2, relationship_type: 'depende de' },
        { id: 2, related_ci_id: 3, relationship_type: 'usa' }
      ];
      pool.query.mockResolvedValue([ fakeRels ]);

      const req = { params: { ciId: '10' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getRelsByCI(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, related_ci_id, relationship_type FROM ci_relationships WHERE ci_id = ?',
        ['10']
      );
      expect(res.json).toHaveBeenCalledWith(fakeRels);
    });

    it('mapea errores a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { ciId: '5' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await getRelsByCI(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener relaciones de CI' });
    });
  });

  describe('createRel', () => {
    it('debe insertar y devolver 201 + nueva relación', async () => {
      pool.query.mockResolvedValue([{ insertId: 99 }]);

      const req = {
        params: { ciId: '10' },
        body: {
          related_ci_id: 20,
          relationship_type: 'alojado en'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createRel(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        `INSERT INTO ci_relationships (ci_id, related_ci_id, relationship_type)
       VALUES (?, ?, ?)`,
        ['10', 20, 'alojado en']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 99,
        ci_id: 10,
        related_ci_id: 20,
        relationship_type: 'alojado en'
      });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = {
        params: { ciId: '10' },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn()
      };

      await createRel(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear relación de CI' });
    });
  });

  describe('deleteRel', () => {
    it('debe eliminar y devolver 204', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const req = { params: { ciId: '10', relId: '5' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        end:    jest.fn(),
        json:   jest.fn()
      };

      await deleteRel(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM ci_relationships WHERE id = ? AND ci_id = ?',
        ['5', '10']
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('devuelve 404 si no existe', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const req = { params: { ciId: '10', relId: '99' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteRel(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Relación no encontrada' });
    });

    it('mapea error a status 500', async () => {
      pool.query.mockRejectedValue(new Error());

      const req = { params: { ciId: '10', relId: '5' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
        end:    jest.fn()
      };

      await deleteRel(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al eliminar relación de CI' });
    });
  });
});
