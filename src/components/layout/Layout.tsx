import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Toaster } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export function Layout() {
  const { session } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  if (!session) return null;

  return (
    <div className={cn(
      "min-h-screen",
      "bg-background text-foreground"
    )}>
      <Navbar isCollapsed={isNavCollapsed} onToggleCollapse={setIsNavCollapsed} />
      <main className={cn(
        "p-8 transition-all duration-300",
        isNavCollapsed ? "ml-16" : "ml-48"
      )}>
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}