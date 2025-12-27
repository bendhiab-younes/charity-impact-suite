import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  LayoutDashboard, 
  Building2, 
  Users, 
  HandHeart, 
  Settings, 
  FileText, 
  BarChart3, 
  ChevronLeft,
  LogOut,
  Shield,
  UserCircle,
  Wallet,
  ClipboardList
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'association_admin', 'association_member', 'donor'] },
  { label: 'Associations', href: '/dashboard/associations', icon: Building2, roles: ['super_admin'] },
  { label: 'Users', href: '/dashboard/users', icon: Users, roles: ['super_admin', 'association_admin'] },
  { label: 'Beneficiaries', href: '/dashboard/beneficiaries', icon: HandHeart, roles: ['association_admin', 'association_member'] },
  { label: 'Families', href: '/dashboard/families', icon: UserCircle, roles: ['association_admin', 'association_member'] },
  { label: 'Donations', href: '/dashboard/donations', icon: Wallet, badge: '3', roles: ['super_admin', 'association_admin', 'association_member', 'donor'] },
  { label: 'Rules', href: '/dashboard/rules', icon: ClipboardList, roles: ['association_admin'] },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['super_admin', 'association_admin'] },
  { label: 'Audit Log', href: '/dashboard/audit', icon: FileText, roles: ['super_admin', 'association_admin'] },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['super_admin', 'association_admin', 'association_member', 'donor'] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
}

export function DashboardLayout({ children, userRole = 'association_admin', userName = 'Michael Chen' }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  
  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    association_admin: 'Admin',
    association_member: 'Member',
    donor: 'Donor',
    public: 'Guest',
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Heart className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">CharityHub</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary mx-auto">
              <Heart className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "absolute -right-3 top-6 bg-sidebar border border-sidebar-border rounded-full"
            )}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <span className="text-sm font-medium">{userName.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-sidebar-primary" />
                  <p className="text-xs text-sidebar-foreground/70">{roleLabels[userRole]}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent" asChild>
                <Link to="/">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent" asChild>
                <Link to="/">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
