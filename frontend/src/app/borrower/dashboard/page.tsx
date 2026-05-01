'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, STATUS_COLORS } from '@/lib/utils';
import { Application } from '@/types';
import api from '@/lib/api';
import { ArrowRight, FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function BorrowerDashboard() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/application/my').then(({ data }) => {
      setApplication(data.application);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getNextStep = () => {
    if (!application || application.status === 'incomplete') {
      if (!application?.breStatus || application.breStatus === 'pending') return '/borrower/apply/personal';
      if (application.breStatus === 'passed' && !application.salarySlipUrl) return '/borrower/apply/upload';
      if (application.salarySlipUrl) return '/borrower/apply/loan';
      return '/borrower/apply/personal';
    }
    return null;
  };

  const nextStep = getNextStep();

  const statusIcon: Record<string, React.ReactNode> = {
    applied: <Clock className="w-5 h-5 text-blue-500" />,
    sanctioned: <CheckCircle className="w-5 h-5 text-green-500" />,
    rejected: <XCircle className="w-5 h-5 text-red-500" />,
    disbursed: <TrendingUp className="w-5 h-5 text-purple-500" />,
    closed: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  };

  return (
    <AuthGuard allowedRoles={['borrower']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Loan Dashboard</h1>
            <p className="text-gray-500 mt-1">Track your loan application status</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : application && application.status !== 'incomplete' ? (
            <div className="space-y-4">
              {/* Status card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      {statusIcon[application.status]}
                      <div>
                        <p className="font-semibold text-gray-900">Loan Application</p>
                        <p className="text-sm text-gray-500">Applied on {formatDate(application.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[application.status]}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  {application.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <strong>Rejection reason:</strong> {application.rejectionReason}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan details */}
              {application.loanAmount && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Loan Details</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Stat label="Loan Amount" value={formatCurrency(application.loanAmount)} />
                      <Stat label="Tenure" value={`${application.tenure} days`} />
                      <Stat label="Interest Rate" value={`${application.interestRate}% p.a.`} />
                      <Stat label="Interest" value={formatCurrency(application.simpleInterest || 0)} />
                      <Stat label="Total Repayment" value={formatCurrency(application.totalRepayment || 0)} highlight />
                      {application.status === 'disbursed' && (
                        <Stat label="Outstanding" value={formatCurrency((application.totalRepayment || 0) - application.totalPaid)} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment progress for disbursed loans */}
              {(application.status === 'disbursed' || application.status === 'closed') && application.totalRepayment && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Repayment Progress</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Paid: {formatCurrency(application.totalPaid)}</span>
                      <span>Total: {formatCurrency(application.totalRepayment)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (application.totalPaid / application.totalRepayment) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((application.totalPaid / application.totalRepayment) * 100)}% repaid
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {application?.breStatus === 'failed' ? 'Application Not Eligible' : 'Apply for a Loan'}
                </h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                  {application?.breStatus === 'failed'
                    ? 'Your application did not meet our eligibility criteria. You can retry after updating your details.'
                    : 'Complete the 3-step application to get your loan approved quickly.'}
                </p>
                {nextStep && (
                  <Button onClick={() => router.push(nextStep)} size="lg">
                    {application ? 'Continue Application' : 'Start Application'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`font-semibold text-sm ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
