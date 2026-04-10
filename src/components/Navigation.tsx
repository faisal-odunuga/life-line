"use client";

import React from 'react';
import { 
  Bell, 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  FileText
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export const TopNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Triage', path: '/triage', icon: Stethoscope },
    { label: 'Records', path: '/records', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Booking', path: '/booking', icon: Calendar },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 md:px-8 h-16 glass-effect rounded-none mt-4 mx-4 shadow-[0px_12px_32px_rgba(0,71,141,0.06)]">
      <div className="hidden md:flex flex-1 items-center">
        <span className="font-serif text-lg md:text-xl font-bold text-primary cursor-pointer" onClick={() => router.push('/')}>Clinical Excellence</span>
      </div>
      <div className="hidden md:flex flex-1 justify-center gap-8 items-center">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`${isActive(item.path) ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'} transition-colors font-serif text-base tracking-tight pb-1 flex items-center gap-2`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="md:hidden flex-1 flex items-center">
        <span className="font-serif text-lg font-bold text-primary cursor-pointer" onClick={() => router.push('/')}>Clinical Excellence</span>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <button
          onClick={() => router.push('/notifications')}
          className="relative p-2 hover:bg-surface-container-low rounded-full transition-all duration-200"
        >
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error animate-pulse" />
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20">
          <img 
            alt="User profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-0nVb-J4R8GP7NUD0Qw8F-ROuha8kJo7ztyCe5ryjr3kfwcbfFNQwlsRqKZUZaJV5K63ZXCa_60-OaV1w8hvtIL5rYCpXzkA3-7UmWDYZ1_bTynKqA5w9CinfQ_v4cH9pWFutHffEIVMWWMPDioRMmrBuV1zE6aD50t8RXEsawF7z0t-4Ooioej7pSQEjFgFtYRNM-beAz3EB-T07-3-kNVWwdTWcUGo7qGkcEzDlaPs-V0zcRi9MoR1AfFoajP4KAQ1NjPj__9gh"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </nav>
  );
};

export const SideNavBar = () => {
  return null;
};

export const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: Stethoscope, label: 'Triage', path: '/triage' },
    { icon: FileText, label: 'Records', path: '/records' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: Calendar, label: 'Book', path: '/booking' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-effect h-20 flex items-center justify-around px-4 border-t border-outline-variant/10 shadow-[0px_-12px_32px_rgba(0,71,141,0.06)]">
      {navItems.map((item, i) => (
        <button 
          key={i}
          onClick={() => router.push(item.path)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive(item.path) ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
