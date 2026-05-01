'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ApplicationCard from '@/components/dashboard/ApplicationCard';
import { Application } from '@/types';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function SanctionDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQueue = () => {
    api.get('/dashboard/sanction/queue').then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReasons[id]?.trim()) {
      toast({ title: 'Rejection reason required', variant: 'destructive' });
      return;
    }
    setActionLoading(id + action);
    try {
      await api.patch(`/dashboard/sanction/${id}`, {
        action,
        rejectionReason: rejectionReasons[id],
      });
      toast({ title: action === 'approve' ? '✅ Application sanctioned' : '❌ Application rejected' });
      fetchQueue();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AuthGuard allowedRoles={['sanction']}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sanction Queue</h1>
          <p className="text-gray-500 mt-1">Review and approve or reject loan applications</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : applications.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-400">No applications pending sanction</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app._id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpanded(expanded === app._id ? null : app._id)}
                  >
                    <ApplicationCard application={app} expanded={expanded === app._id} />
                  </div>

                  {expanded === app._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <Input
                        placeholder="Rejection reason (required if rejecting)"
                        value={rejectionReasons[app._id] || ''}
                        onChange={(e) => setRejectionReasons({ ...rejectionReasons, [app._id]: e.target.value })}
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(app._id, 'reject')}
                          disabled={actionLoading === app._id + 'reject'}
                        >
                          {actionLoading === app._id + 'reject' ? 'Rejecting…' : 'Reject'}
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleAction(app._id, 'approve')}
                          disabled={actionLoading === app._id + 'approve'}
                        >
                          {actionLoading === app._id + 'approve' ? 'Sanctioning…' : 'Sanction'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {expanded !== app._id && (
                    <button
                      className="mt-2 text-xs text-blue-600 hover:underline"
                      onClick={() => setExpanded(app._id)}
                    >
                      View details & take action →
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
