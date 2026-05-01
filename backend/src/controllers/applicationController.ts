import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Application from '../models/Application';
import { runBRE, calculateLoan } from '../utils/bre';
import { uploadToCloudinary } from '../config/cloudinary';

// GET /api/application/my — get borrower's own application
export const getMyApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await Application.findOne({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, application: app });
};

// POST /api/application/personal — step 2: personal details + BRE
export const submitPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

  if (!fullName || !pan || !dateOfBirth || !monthlySalary || !employmentMode) {
    res.status(400).json({ success: false, message: 'All personal details are required' });
    return;
  }

  const dob = new Date(dateOfBirth);
  const salary = Number(monthlySalary);

  const bre = runBRE({ dateOfBirth: dob, monthlySalary: salary, pan, employmentMode });

  // Find or create application for this user
  let application = await Application.findOne({ userId: req.user!.id, status: 'incomplete' });
  if (!application) {
    application = new Application({ userId: req.user!.id });
  }

  application.fullName = fullName;
  application.pan = pan.toUpperCase();
  application.dateOfBirth = dob;
  application.monthlySalary = salary;
  application.employmentMode = employmentMode;
  application.breStatus = bre.passed ? 'passed' : 'failed';
  application.breFailureReasons = bre.reasons;

  await application.save();

  if (!bre.passed) {
    res.status(422).json({
      success: false,
      message: 'Application rejected by eligibility check',
      reasons: bre.reasons,
      application,
    });
    return;
  }

  res.json({ success: true, message: 'Eligibility check passed', application });
};

// POST /api/application/upload — step 3: salary slip upload
export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const application = await Application.findOne({ userId: req.user!.id, status: 'incomplete', breStatus: 'passed' });
  if (!application) {
    res.status(404).json({ success: false, message: 'No eligible application found. Complete personal details first.' });
    return;
  }

  const url = await uploadToCloudinary(req.file.buffer, 'lms/salary-slips');
  application.salarySlipUrl = url;
  await application.save();

  res.json({ success: true, message: 'Salary slip uploaded', salarySlipUrl: url, application });
};

// POST /api/application/loan — step 4: loan config + apply
export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { loanAmount, tenure } = req.body;

  const amount = Number(loanAmount);
  const days = Number(tenure);

  if (!amount || !days) {
    res.status(400).json({ success: false, message: 'Loan amount and tenure are required' });
    return;
  }

  if (amount < 50000 || amount > 500000) {
    res.status(400).json({ success: false, message: 'Loan amount must be between ₹50,000 and ₹5,00,000' });
    return;
  }

  if (days < 30 || days > 365) {
    res.status(400).json({ success: false, message: 'Tenure must be between 30 and 365 days' });
    return;
  }

  const application = await Application.findOne({
    userId: req.user!.id,
    status: 'incomplete',
    breStatus: 'passed',
    salarySlipUrl: { $exists: true, $ne: null },
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Complete all previous steps first' });
    return;
  }

  const { simpleInterest, totalRepayment, interestRate } = calculateLoan(amount, days);

  application.loanAmount = amount;
  application.tenure = days;
  application.interestRate = interestRate;
  application.simpleInterest = simpleInterest;
  application.totalRepayment = totalRepayment;
  application.status = 'applied';

  await application.save();

  res.json({ success: true, message: 'Loan application submitted successfully', application });
};

// GET /api/application/:id — get single application (for dashboard)
export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  const application = await Application.findById(req.params.id).populate('userId', 'name email');
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }
  res.json({ success: true, application });
};
