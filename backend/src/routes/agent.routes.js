import { Router } from 'express';
import { createAgent, getAgents, getAgentById, updateAgent, deleteAgent } from '../controllers/agent.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { createAgentSchema, updateAgentSchema, idParamSchema, listAgentsQuerySchema } from '../validators/agent.validator.js';

const router = Router();

router.route('/createAgent').post(requireAuth, validate(createAgentSchema), createAgent);
router.route('/getAgents').get(requireAuth, validate(listAgentsQuerySchema, "query"), getAgents);
router.route('/getAgent/:id').get(requireAuth, validate(idParamSchema, "params"), getAgentById);
router.route('/updateAgent/:id').put(requireAuth, validate(idParamSchema, "params"), validate(updateAgentSchema), updateAgent);
router.route('/deleteAgent/:id').delete(requireAuth, validate(idParamSchema, "params"), deleteAgent);

export default router;