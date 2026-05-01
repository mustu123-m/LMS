import { EmploymentMode } from '../models/Application';

export interface BREInput {
  dateOfBirth: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: EmploymentMode;
}

export interface BREResult {
  passed: boolean;
  reasons: string[];
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function runBRE(input: BREInput): BREResult {
  const reasons: string[] = [];

  // Age check: 23–50
  const today = new Date();
  let age = today.getFullYear() - input.dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - input.dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < input.dateOfBirth.getDate())) {
    age--;
  }
  if (age < 23 || age > 50) {
    reasons.push(`Age must be between 23 and 50 years (your age: ${age})`);
  }

  // Salary check: >= ₹25,000
  if (input.monthlySalary < 25000) {
    reasons.push(`Monthly salary must be at least ₹25,000 (provided: ₹${input.monthlySalary.toLocaleString('en-IN')})`);
  }

  // PAN format: 5 letters, 4 digits, 1 letter
  if (!PAN_REGEX.test(input.pan.toUpperCase())) {
    reasons.push('PAN must be in valid format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)');
  }

  // Employment: not unemployed
  if (input.employmentMode === 'unemployed') {
    reasons.push('Unemployed applicants are not eligible for a loan');
  }

  return { passed: reasons.length === 0, reasons };
}

export function calculateLoan(principal: number, tenureDays: number) {
  const rate = 12; // p.a.
  const si = (principal * rate * tenureDays) / (365 * 100);
  const total = principal + si;
  return {
    simpleInterest: Math.round(si * 100) / 100,
    totalRepayment: Math.round(total * 100) / 100,
    interestRate: rate,
  };
}
