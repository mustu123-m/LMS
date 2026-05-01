'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { Users, UserCheck, UserX } from 'lucide-react';

export default function SalesDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/sales/leads').then(({ data }) => setLeads(data.leads)).finally(() => setLoading(false));
  }, []);

  const applied = leads.filter((l) => l.hasApplied);
  const notApplied = leads.filter((l) => !l.hasApplied);

  return (
    <AuthGuard allowedRoles={['sales']}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sales — Lead Tracking</h1>
          <p className="text-gray-500 mt-1">All registered borrowers and their application status</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Users className="w-5 h-5 text-blue-500" />} label="Total Leads" value={leads.length} color="blue" />
          <StatCard icon={<UserCheck className="w-5 h-5 text-green-500" />} label="Applied" value={applied.length} color="green" />
          <StatCard icon={<UserX className="w-5 h-5 text-orange-500" />} label="Not Applied" value={notApplied.length} color="orange" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : leads.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-400">No leads yet</CardContent></Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">All Leads ({leads.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <div key={lead._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(lead.createdAt)}</p>
                    </div>
                    <Badge variant={lead.hasApplied ? 'default' : 'secondary'}>
                      {lead.hasApplied ? 'Applied' : 'Not Applied'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const bg: Record<string, string> = { blue: 'bg-blue-50', green: 'bg-green-50', orange: 'bg-orange-50' };
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-9 h-9 ${bg[color]} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
