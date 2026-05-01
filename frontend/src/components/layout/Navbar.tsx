'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    sales: 'Sales',
    sanction: 'Sanction',
    disbursement: 'Disbursement',
    collection: 'Collection',
    borrower: 'Borrower',
  };

  const roleBg: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    sales: 'bg-blue-100 text-blue-700',
    sanction: 'bg-green-100 text-green-700',
    disbursement: 'bg-orange-100 text-orange-700',
    collection: 'bg-red-100 text-red-700',
    borrower: 'bg-gray-100 text-gray-700',
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-lg">LoanFlow</span>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBg[user.role] || 'bg-gray-100 text-gray-700'}`}>
              {roleLabel[user.role] || user.role}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </Button>
        </div>
      )}
    </nav>
  );
}
