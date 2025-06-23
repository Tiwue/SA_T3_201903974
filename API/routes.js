import { Router } from 'express';
import * as ciCtrl        from './controllers/ciController.js';
import * as typeCtrl      from './controllers/ciTypeController.js';
import * as envCtrl       from './controllers/enviromentControler.js';
import * as changeCtrl    from './controllers/ciChangeController.js';
import * as relCtrl       from './controllers/ciRelationshipController.js';

const router = Router();

// --- CI types ---
router
  .route('/types')
  .get(typeCtrl.getAllTypes)
  .post(typeCtrl.createType);

router
  .route('/types/:id')
  .get(typeCtrl.getTypeById)
  .put(typeCtrl.updateType)
  .delete(typeCtrl.deleteType);

// --- Environments ---
router
  .route('/envs')
  .get(envCtrl.getAllEnvs)
  .post(envCtrl.createEnv);

router
  .route('/envs/:id')
  .get(envCtrl.getEnvById)
  .put(envCtrl.updateEnv)
  .delete(envCtrl.deleteEnv);

// --- Configuration Items (CIs) ---
router
  .route('/cis')
  .get(ciCtrl.getAllCIs)
  .post(ciCtrl.createCI);

router
  .route('/cis/:id')
  .get(ciCtrl.getCIById)
  .put(ciCtrl.updateCI)
  .delete(ciCtrl.deleteCI);

// --- CI Changes (auditoría) ---
router
  .route('/cis/:ciId/changes')
  .get(changeCtrl.getChangesByCI)
  .post(changeCtrl.createChange);

// --- CI Relationships ---
router
  .route('/cis/:ciId/relationships')
  .get(relCtrl.getRelsByCI)
  .post(relCtrl.createRel);

router
  .route('/cis/:ciId/relationships/:relId')
  .delete(relCtrl.deleteRel);

export default router;
