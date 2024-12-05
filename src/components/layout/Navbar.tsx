import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { ChevronLeft, ChevronRight, Home, Users, UserCheck, Megaphone, MessageSquare, BarChart3, UserCircle, LogOut, Sun, Moon, Settings, Plug } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/customers', icon: UserCheck, label: 'Customers' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' }
];

interface NavbarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function Navbar({ isCollapsed, onToggleCollapse }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { session } = useAuth();
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; company_name?: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, company_name')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [session?.user?.id]);

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 h-screen bg-card border-r border-border p-3",
      "transition-all duration-300",
      isCollapsed ? "w-16" : "w-48"
    )}>
      <div className="mb-8 relative">
        <img
          src={theme === 'dark' ? '/ottternaut-dashboard-dark.png' : '/otternaut-dashboard-light.png'}
          alt="Otternaut"
          className={cn(
            "h-6 w-auto transition-opacity duration-300",
            isCollapsed && "opacity-0"
          )}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-1 top-0"
          onClick={() => onToggleCollapse(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ul className="space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors text-sm",
                !isCollapsed && "space-x-2",
                isCollapsed && "justify-center",
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={label}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className={cn(
        "absolute bottom-4 space-y-4",
        isCollapsed ? "left-2 right-2" : "left-4 right-4"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm",
                !isCollapsed && "space-x-2"
              )}
            >
              <UserCircle className="w-4 h-4" />
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="truncate font-medium">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : session?.user?.email}
                  </span>
                  {profile?.company_name && (
                    <span className="text-xs text-muted-foreground truncate">
                      {profile.company_name}
                    </span>
                  )}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="w-4 h-4 mr-2" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/integrations')}>
              <Plug className="w-4 h-4 mr-2" />
              <span>Integrations</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="w-4 h-4 mr-2" />
              <span>Light Mode</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="w-4 h-4 mr-2" />
              <span>Dark Mode</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className={cn("text-xs text-center text-muted-foreground", isCollapsed && "hidden")}>
          Version 1.0.0
        </div>
      </div>
    </nav>
  );
}