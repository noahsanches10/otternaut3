import React from 'react';
import { ArrowRight, Users, UserCheck, Megaphone, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Home() {
  const stats = [
    { label: 'Active Leads', value: '24', to: '/leads', icon: Users },
    { label: 'Total Customers', value: '156', to: '/customers', icon: UserCheck },
    { label: 'Active Campaigns', value: '3', to: '/campaigns', icon: Megaphone },
    { label: 'Conversion Rate', value: '12.4%', to: '/analytics', icon: PieChart },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Here's what's happening with your sales today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className={cn(
              "group block p-6 bg-card rounded-lg border border-border shadow-sm",
              "hover:bg-accent hover:border-accent transition-all duration-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}