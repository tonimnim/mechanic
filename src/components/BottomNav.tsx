'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on login, register, welcome pages
  if (pathname === '/login' || pathname.startsWith('/register') || pathname === '/welcome') {
    return null;
  }

  // Determine if user is a mechanic/breakdown service provider
  const isMechanic = user?.role === 'mechanic' || user?.role === 'breakdown';

  // Navigation items for mechanics (3 tabs: Dashboard, Chats, Profile)
  const mechanicNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chats', label: 'Chats', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Navigation items for drivers/clients (4 tabs: Home, Find, Chats, Profile)
  const driverNavItems: NavItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/find', label: 'Find', icon: Search },
    { href: '/chats', label: 'Chats', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const navItems = isMechanic ? mechanicNavItems : driverNavItems;

  // Check if current path matches nav item (including nested routes)
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
