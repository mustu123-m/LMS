'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import StepProgress from '@/components/borrower/StepProgress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function PersonalDetailsPage() {
  const [form, setForm] = useState({
    fullName: '', pan: '', dateOfBirth: '', monthlySalary: '', employmentMode: '',
  });
  const [loading, setLoading] = useState(false);
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreErrors([]);
    setLoading(true);
    try {
      await api.post('/application/personal', {
        ...form,
        monthlySalary: Number(form.monthlySalary),
      });
      toast({ title: 'Eligibility check passed!', description: 'Proceeding to document upload.' });
      router.push('/borrower/apply/upload');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { reasons?: string[]; message?: string } } };
      if (error.response?.data?.reasons?.length) {
        setBreErrors(error.response.data.reasons);
      } else {
        toast({ title: 'Error', description: error.response?.data?.message || 'Something went wrong', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['borrower']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <StepProgress currentStep={0} />

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>We&apos;ll use this to check your loan eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              {breErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-red-700 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Eligibility Check Failed</span>
                  </div>
                  {breErrors.map((r, i) => <p key={i} className="text-sm text-red-600 ml-6">• {r}</p>)}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="As per PAN card" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input id="pan" placeholder="ABCDE1234F" maxLength={10} value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} required />
                    <p className="text-xs text-gray-400">Format: 5 letters + 4 digits + 1 letter</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required max={new Date().toISOString().split('T')[0]} />
                    <p className="text-xs text-gray-400">Must be between 23–50 years old</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary (₹)</Label>
                    <Input id="salary" type="number" placeholder="e.g. 50000" min={0} value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} required />
                    <p className="text-xs text-gray-400">Minimum ₹25,000/month required</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Employment Mode</Label>
                  <Select value={form.employmentMode} onValueChange={(v) => setForm({ ...form, employmentMode: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">Salaried</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => router.push('/borrower/dashboard')}>Back</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Checking eligibility…' : 'Check Eligibility & Continue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
