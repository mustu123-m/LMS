import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import {
  getMyApplication,
  submitPersonalDetails,
  uploadSalarySlip,
  applyLoan,
  getApplicationById,
} from '../controllers/applicationController';

const router = Router();

router.use(authenticate);

router.get('/my', authorize('borrower'), getMyApplication);
router.post('/personal', authorize('borrower'), submitPersonalDetails);
router.post('/upload', authorize('borrower'), upload.single('salarySlip'), uploadSalarySlip);
router.post('/loan', authorize('borrower'), applyLoan);
router.get('/:id', authorize('admin', 'sanction', 'disbursement', 'collection', 'sales'), getApplicationById);

export default router;
