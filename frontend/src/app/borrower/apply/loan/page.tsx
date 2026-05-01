'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import StepProgress from '@/components/borrower/StepProgress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, calculateSI } from '@/lib/utils';
import api from '@/lib/api';

export default function LoanConfigPage() {
  const [loanAmount, setLoanAmount] = useState(150000);
  const [tenure, setTenure] = useState(180);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { si, total } = calculateSI(loanAmount, tenure);

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post('/application/loan', { loanAmount, tenure });
      toast({ title: '🎉 Loan application submitted!', description: 'Our team will review it shortly.' });
      router.push('/borrower/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: error.response?.data?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['borrower']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <StepProgress currentStep={2} />

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Configure Your Loan</CardTitle>
              <CardDescription>Adjust the sliders to find the right loan for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(loanAmount)}</span>
                </div>
                <input
                  type="range" min={50000} max={500000} step={5000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹50,000</span><span>₹5,00,000</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Tenure</label>
                  <span className="text-lg font-bold text-blue-600">{tenure} days</span>
                </div>
                <input
                  type="range" min={30} max={365} step={5}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>30 days</span><span>365 days</span>
                </div>
              </div>

              {/* Live Calculation Panel */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-4 text-blue-100">Loan Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <CalcItem label="Principal" value={formatCurrency(loanAmount)} />
                  <CalcItem label="Interest Rate" value="12% p.a." />
                  <CalcItem label="Tenure" value={`${tenure} days`} />
                  <CalcItem label="Interest (SI)" value={formatCurrency(si)} />
                </div>
                <div className="mt-4 pt-4 border-t border-blue-500/50 flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Total Repayment</span>
                  <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                </div>
                <p className="text-xs text-blue-200 mt-2">
                  SI = (P × R × T) / (365 × 100) = ₹{si.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/borrower/apply/upload')}>Back</Button>
                <Button className="flex-1" size="lg" onClick={handleApply} disabled={loading}>
                  {loading ? 'Submitting…' : '🚀 Apply Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}

function CalcItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-200 text-xs">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}
