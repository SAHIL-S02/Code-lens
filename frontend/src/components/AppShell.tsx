'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code2,
  FolderKanban,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth';

const nav = [
  { href: '/dashboard', label: 'Projects', icon: FolderKanban },
  { href: '/settings', label: 'AI Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-800 px-6 py-5">
          <Sparkles className="h-6 w-6 text-indigo-400" />
          <div>
            <p className="font-semibold tracking-tight">Code Lens</p>
            <p className="text-xs text-slate-400">AI Code Review</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname.startsWith(href)
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-2 px-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
