'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Users, CheckSquare, DollarSign, CreditCard, LayoutDashboard } from 'lucide-react';

const navItems = [
  { href: '/dashboard/sales', label: 'Sales', icon: Users, roles: ['admin', 'sales'] },
  { href: '/dashboard/sanction', label: 'Sanction', icon: CheckSquare, roles: ['admin', 'sanction'] },
  { href: '/dashboard/disbursement', label: 'Disbursement', icon: DollarSign, roles: ['admin', 'disbursement'] },
  { href: '/dashboard/collection', label: 'Collection', icon: CreditCard, roles: ['admin', 'collection'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <aside className="w-56 min-h-[calc(100vh-57px)] bg-white border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Operations</p>
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 flex z-40">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors',
                pathname === item.href ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
