import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Application from '../models/Application';
import Payment from '../models/Payment';
import User from '../models/User';

// ── SALES ──────────────────────────────────────────────────────────────────
// Users who registered but haven't applied (leads)
export const getSalesLeads = async (_req: AuthRequest, res: Response): Promise<void> => {
  const borrowers = await User.find({ role: 'borrower' }).select('-password').lean();
  const borrowerIds = borrowers.map((b) => b._id);

  // Find those with applied/further applications
  const appliedIds = await Application.distinct('userId', {
    userId: { $in: borrowerIds },
    status: { $nin: ['incomplete'] },
  });

  const leads = borrowers.map((b) => ({
    ...b,
    hasApplied: appliedIds.some((id) => id.toString() === b._id.toString()),
  }));

  res.json({ success: true, leads });
};

// ── SANCTION ───────────────────────────────────────────────────────────────
export const getSanctionQueue = async (_req: AuthRequest, res: Response): Promise<void> => {
  const applications = await Application.find({ status: 'applied' })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, applications });
};

export const sanctionApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

  const application = await Application.findById(id);
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }
  if (application.status !== 'applied') {
    res.status(400).json({ success: false, message: 'Application is not in applied state' });
    return;
  }

  if (action === 'approve') {
    application.status = 'sanctioned';
    application.sanctionedBy = req.user!.id as unknown as typeof application.sanctionedBy;
    application.sanctionedAt = new Date();
  } else if (action === 'reject') {
    if (!rejectionReason) {
      res.status(400).json({ success: false, message: 'Rejection reason is required' });
      return;
    }
    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
  } else {
    res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    return;
  }

  await application.save();
  res.json({ success: true, application });
};

// ── DISBURSEMENT ───────────────────────────────────────────────────────────
export const getDisbursementQueue = async (_req: AuthRequest, res: Response): Promise<void> => {
  const applications = await Application.find({ status: 'sanctioned' })
    .populate('userId', 'name email')
    .sort({ sanctionedAt: -1 })
    .lean();
  res.json({ success: true, applications });
};

export const disburseApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const application = await Application.findById(id);
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }
  if (application.status !== 'sanctioned') {
    res.status(400).json({ success: false, message: 'Application is not sanctioned yet' });
    return;
  }

  application.status = 'disbursed';
  application.disbursedBy = req.user!.id as unknown as typeof application.disbursedBy;
  application.disbursedAt = new Date();

  await application.save();
  res.json({ success: true, application });
};

// ── COLLECTION ─────────────────────────────────────────────────────────────
export const getCollectionQueue = async (_req: AuthRequest, res: Response): Promise<void> => {
  const applications = await Application.find({ status: { $in: ['disbursed', 'closed'] } })
    .populate('userId', 'name email')
    .sort({ disbursedAt: -1 })
    .lean();

  const appIds = applications.map((a) => a._id);
  const payments = await Payment.find({ applicationId: { $in: appIds } })
    .populate('recordedBy', 'name')
    .lean();

  const result = applications.map((app) => ({
    ...app,
    payments: payments.filter((p) => p.applicationId.toString() === app._id.toString()),
  }));

  res.json({ success: true, applications: result });
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params; // application id
  const { utrNumber, amount, paymentDate } = req.body;

  if (!utrNumber || !amount || !paymentDate) {
    res.status(400).json({ success: false, message: 'UTR number, amount, and payment date are required' });
    return;
  }

  const application = await Application.findById(id);
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }
  if (application.status !== 'disbursed') {
    res.status(400).json({ success: false, message: 'Loan is not in disbursed state' });
    return;
  }

  const paymentAmount = Number(amount);
  const outstanding = (application.totalRepayment || 0) - application.totalPaid;

  if (paymentAmount <= 0) {
    res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    return;
  }
  if (paymentAmount > outstanding) {
    res.status(400).json({
      success: false,
      message: `Payment amount (₹${paymentAmount.toLocaleString('en-IN')}) exceeds outstanding balance (₹${outstanding.toLocaleString('en-IN')})`,
    });
    return;
  }

  // Check UTR uniqueness
  const existingPayment = await Payment.findOne({ utrNumber: utrNumber.toUpperCase() });
  if (existingPayment) {
    res.status(400).json({ success: false, message: 'UTR number already used in another payment' });
    return;
  }

  const payment = await Payment.create({
    applicationId: id,
    userId: application.userId,
    utrNumber: utrNumber.toUpperCase(),
    amount: paymentAmount,
    paymentDate: new Date(paymentDate),
    recordedBy: req.user!.id,
  });

  application.totalPaid += paymentAmount;

  // Auto-close if fully paid
  if (application.totalPaid >= (application.totalRepayment || 0)) {
    application.status = 'closed';
    application.closedAt = new Date();
  }

  await application.save();

  res.json({ success: true, payment, application });
};

// ── ADMIN: all applications ────────────────────────────────────────────────
export const getAllApplications = async (_req: AuthRequest, res: Response): Promise<void> => {
  const applications = await Application.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, applications });
};
