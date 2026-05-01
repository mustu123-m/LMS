import mongoose, { Document, Schema } from 'mongoose';

export type EmploymentMode = 'salaried' | 'self-employed' | 'unemployed';
export type LoanStatus =
  | 'incomplete'
  | 'applied'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'closed';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Personal details
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;

  // BRE
  breStatus: 'pending' | 'passed' | 'failed';
  breFailureReasons: string[];

  // Documents
  salarySlipUrl?: string;
  salarySlipPublicId?: string;

  // Loan config
  loanAmount?: number;
  tenure?: number; // days
  interestRate: number; // fixed 12% p.a.
  simpleInterest?: number;
  totalRepayment?: number;

  // Status lifecycle
  status: LoanStatus;
  rejectionReason?: string;

  // Tracking
  sanctionedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  closedAt?: Date;

  // Payments
  totalPaid: number;

  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, trim: true, default: '' },
    pan: { type: String, uppercase: true, trim: true, default: '' },
    dateOfBirth: { type: Date },
    monthlySalary: { type: Number, default: 0 },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self-employed', 'unemployed'],
    },
    breStatus: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    breFailureReasons: [{ type: String }],
    salarySlipUrl: { type: String },
    salarySlipPublicId: { type: String },
    loanAmount: { type: Number },
    tenure: { type: Number },
    interestRate: { type: Number, default: 12 },
    simpleInterest: { type: Number },
    totalRepayment: { type: Number },
    status: {
      type: String,
      enum: ['incomplete', 'applied', 'sanctioned', 'rejected', 'disbursed', 'closed'],
      default: 'incomplete',
    },
    rejectionReason: { type: String },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
    totalPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', applicationSchema);
