export type LoanStatus = 'incomplete' | 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
export type EmploymentMode = 'salaried' | 'self-employed' | 'unemployed';

export interface Application {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  breStatus: 'pending' | 'passed' | 'failed';
  breFailureReasons: string[];
  salarySlipUrl?: string;
  loanAmount?: number;
  tenure?: number;
  interestRate: number;
  simpleInterest?: number;
  totalRepayment?: number;
  status: LoanStatus;
  rejectionReason?: string;
  totalPaid: number;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  applicationId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  recordedBy: { _id: string; name: string } | string;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  role: string;
  hasApplied: boolean;
  createdAt: string;
}
