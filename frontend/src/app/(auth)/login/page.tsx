'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      toast({ title: 'Welcome back!', description: `Logged in as ${data.user.name}` });

      const role = data.user.role;
      if (role === 'borrower') router.push('/borrower/dashboard');
      else if (role === 'sales') router.push('/dashboard/sales');
      else if (role === 'sanction') router.push('/dashboard/sanction');
      else if (role === 'disbursement') router.push('/dashboard/disbursement');
      else if (role === 'collection') router.push('/dashboard/collection');
      else router.push('/dashboard/sales'); // admin
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Login failed', description: error.response?.data?.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">Sign up</Link>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700 mb-2">Demo credentials:</p>
          <p>Borrower: borrower@lms.com / Borrower@123</p>
          <p>Sales: sales@lms.com / Sales@123</p>
          <p>Sanction: sanction@lms.com / Sanction@123</p>
          <p>Disburse: disburse@lms.com / Disburse@123</p>
          <p>Collection: collection@lms.com / Collect@123</p>
          <p>Admin: admin@lms.com / Admin@123</p>
        </div>
      </CardContent>
    </Card>
  );
}
