import { Application } from '@/types';
import { formatCurrency, formatDate, STATUS_COLORS } from '@/lib/utils';

interface ApplicationCardProps {
  application: Application;
  expanded?: boolean;
}

export default function ApplicationCard({ application, expanded = false }: ApplicationCardProps) {
  const user = typeof application.userId === 'object' ? application.userId : null;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-gray-900">{application.fullName || user?.name || 'N/A'}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[application.status]}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </span>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {application.pan && <Info label="PAN" value={application.pan} />}
          {application.monthlySalary > 0 && <Info label="Monthly Salary" value={formatCurrency(application.monthlySalary)} />}
          {application.employmentMode && <Info label="Employment" value={application.employmentMode} />}
          {application.loanAmount && <Info label="Loan Amount" value={formatCurrency(application.loanAmount)} />}
          {application.tenure && <Info label="Tenure" value={`${application.tenure} days`} />}
          {application.totalRepayment && <Info label="Total Repayment" value={formatCurrency(application.totalRepayment)} highlight />}
          {application.totalPaid > 0 && <Info label="Amount Paid" value={formatCurrency(application.totalPaid)} />}
          {application.totalRepayment && application.totalPaid >= 0 && (
            <Info label="Outstanding" value={formatCurrency(application.totalRepayment - application.totalPaid)} />
          )}
        </div>
      )}

      {application.salarySlipUrl && expanded && (
        <a
          href={application.salarySlipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          📄 View Salary Slip
        </a>
      )}

      {application.rejectionReason && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <span className="font-medium">Rejection reason:</span> {application.rejectionReason}
        </div>
      )}

      <p className="text-xs text-gray-400">Applied: {formatDate(application.createdAt)}</p>
    </div>
  );
}

function Info({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-2.5 rounded-lg ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
