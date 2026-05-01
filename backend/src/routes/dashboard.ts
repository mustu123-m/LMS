import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getSalesLeads,
  getSanctionQueue,
  sanctionApplication,
  getDisbursementQueue,
  disburseApplication,
  getCollectionQueue,
  recordPayment,
  getAllApplications,
} from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);

// Sales
router.get('/sales/leads', authorize('sales'), getSalesLeads);

// Sanction
router.get('/sanction/queue', authorize('sanction'), getSanctionQueue);
router.patch('/sanction/:id', authorize('sanction'), sanctionApplication);

// Disbursement
router.get('/disbursement/queue', authorize('disbursement'), getDisbursementQueue);
router.patch('/disbursement/:id/disburse', authorize('disbursement'), disburseApplication);

// Collection
router.get('/collection/queue', authorize('collection'), getCollectionQueue);
router.post('/collection/:id/payment', authorize('collection'), recordPayment);

// Admin
router.get('/admin/all', authorize('admin'), getAllApplications);

export default router;
