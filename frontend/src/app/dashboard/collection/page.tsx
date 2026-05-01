'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApplicationCard from '@/components/dashboard/ApplicationCard';
import { Application, Payment } from '@/types';
import { formatCurrency, formatDate, STATUS_COLORS } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface AppWithPayments extends Application {
  payments: Payment[];
}

export default function CollectionDashboard() {
  const [applications, setApplications] = useState<AppWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paymentForms, setPaymentForms] = useState<Record<string, { utrNumber: string; amount: string; paymentDate: string }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQueue = () => {
    api.get('/dashboard/collection/queue').then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const getForm = (id: string) => paymentForms[id] || { utrNumber: '', amount: '', paymentDate: '' };

  const handlePayment = async (appId: string) => {
    const form = getForm(appId);
    if (!form.utrNumber || !form.amount || !form.paymentDate) {
      toast({ title: 'All payment fields are required', variant: 'destructive' });
      return;
    }
    setSubmitting(appId);
    try {
      await api.post(`/dashboard/collection/${appId}/payment`, {
        utrNumber: form.utrNumber,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
      });
      toast({ title: '✅ Payment recorded successfully!' });
      setPaymentForms({ ...paymentForms, [appId]: { utrNumber: '', amount: '', paymentDate: '' } });
      fetchQueue();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <AuthGuard allowedRoles={['collection']}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Collection</h1>
          <p className="text-gray-500 mt-1">Record payments for disbursed loans</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : applications.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-400">No active loans for collection</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const outstanding = Math.round(((app.totalRepayment || 0) - app.totalPaid) * 100) / 100;
              const form = getForm(app._id);
              const isDisbursed = app.status === 'disbursed';

              return (
                <Card key={app._id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="cursor-pointer" onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                      <ApplicationCard application={app} expanded={expanded === app._id} />
                    </div>

                    {expanded === app._id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                        {/* Repayment bar */}
                        {app.totalRepayment && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Paid: {formatCurrency(app.totalPaid)}</span>
                              <span>Total: {formatCurrency(app.totalRepayment)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${app.status === 'closed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (app.totalPaid / app.totalRepayment) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Outstanding: <strong>{formatCurrency(outstanding)}</strong>
                            </p>
                          </div>
                        )}

                        {/* Payment history */}
                        {app.payments.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Payment History</p>
                            <div className="space-y-1.5">
                              {app.payments.map((p) => (
                                <div key={p._id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-sm">
                                  <div>
                                    <span className="font-medium text-gray-900">{p.utrNumber}</span>
                                    <span className="text-gray-400 text-xs ml-2">{formatDate(p.paymentDate)}</span>
                                  </div>
                                  <span className="font-semibold text-green-600">{formatCurrency(p.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Record payment form */}
                        {isDisbursed && outstanding > 0 && (
                          <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-700">Record Payment</p>
                            <div className="grid sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">UTR Number</Label>
                                <Input
                                  placeholder="UTR123456"
                                  value={form.utrNumber}
                                  onChange={(e) => setPaymentForms({ ...paymentForms, [app._id]: { ...form, utrNumber: e.target.value } })}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Amount (₹)</Label>
                                <Input
                                  type="number"
                                  placeholder={`Max ${outstanding}`}
                                  min={1}
                                  max={outstanding}
                                  value={form.amount}
                                  onChange={(e) => setPaymentForms({ ...paymentForms, [app._id]: { ...form, amount: e.target.value } })}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Payment Date</Label>
                                <Input
                                  type="date"
                                  value={form.paymentDate}
                                  max={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => setPaymentForms({ ...paymentForms, [app._id]: { ...form, paymentDate: e.target.value } })}
                                />
                              </div>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => handlePayment(app._id)}
                              disabled={submitting === app._id}
                            >
                              {submitting === app._id ? 'Recording…' : 'Record Payment'}
                            </Button>
                          </div>
                        )}

                        {app.status === 'closed' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-medium text-center">
                            ✅ Loan fully repaid and closed
                          </div>
                        )}
                      </div>
                    )}

                    {expanded !== app._id && (
                      <button
                        className="mt-2 text-xs text-blue-600 hover:underline"
                        onClick={() => setExpanded(app._id)}
                      >
                        View details & record payment →
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
