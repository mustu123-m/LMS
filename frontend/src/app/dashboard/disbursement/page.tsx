'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApplicationCard from '@/components/dashboard/ApplicationCard';
import { Application } from '@/types';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function DisbursementDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [disbursing, setDisbursing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQueue = () => {
    api.get('/dashboard/disbursement/queue').then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleDisburse = async (id: string) => {
    setDisbursing(id);
    try {
      await api.patch(`/dashboard/disbursement/${id}/disburse`);
      toast({ title: '💸 Loan disbursed successfully!' });
      fetchQueue();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    } finally {
      setDisbursing(null);
    }
  };

  return (
    <AuthGuard allowedRoles={['disbursement']}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Disbursement Queue</h1>
          <p className="text-gray-500 mt-1">Mark sanctioned loans as disbursed</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : applications.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-400">No sanctioned loans pending disbursement</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app._id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="cursor-pointer" onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                    <ApplicationCard application={app} expanded={expanded === app._id} />
                  </div>

                  {expanded === app._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        className="w-full"
                        onClick={() => handleDisburse(app._id)}
                        disabled={disbursing === app._id}
                      >
                        {disbursing === app._id ? 'Processing…' : '💸 Mark as Disbursed'}
                      </Button>
                    </div>
                  )}

                  {expanded !== app._id && (
                    <button
                      className="mt-2 text-xs text-blue-600 hover:underline"
                      onClick={() => setExpanded(app._id)}
                    >
                      View details & disburse →
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
