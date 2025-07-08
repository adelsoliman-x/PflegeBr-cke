import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LogOut, Globe, User, Calendar, Sun, Moon, CreditCard, ShieldCheck, Menu, Users
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, signOut, isSubscriptionActive } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { toggleTheme } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCashRequests = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/cash-requests`, {
          headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const pending = data.filter(req => req.status === 'pending');
        setPendingCount(pending.length);
      } catch (err) {
        console.error('❌ Failed to fetch cash requests:', err);
      }
    };

    if (user?.role === 'admin') fetchCashRequests();
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="glass-effect border-b border-border sticky top-0 z-50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Role */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <span
              onClick={() => {
                if (!user) return navigate('/');
                navigate(user.role === 'admin' ? '/dashboard' : '/jobs');
              }}
              className="cursor-pointer text-xl font-bold gradient-text"
            >
              {t('jobBoard')}
            </span>
            {user && (
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {t(user.role)}
              </Badge>
            )}
          </motion.div>

          {/* Large Screens */}
          <div className="hidden sm:flex items-center space-x-2">
            {user?.role === 'admin' && (
              <>
                <Link to="/admin-cash-requests" className="relative flex items-center gap-2 px-3 py-2 hover:bg-muted rounded">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{t('cashRequests')}</span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>
                <Link to="/admin-users" className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{t('users')}</span>
                </Link>
              </>
            )}

            {user?.role === 'viewer' && (
              <Link to="/subscription" className="flex items-center space-x-2 text-sm hover:text-primary">
                <Calendar className="h-4 w-4" />
                <span className={isSubscriptionActive() ? 'text-green-400' : 'text-red-400'}>
                  {isSubscriptionActive() ? t('subscriptionActive') : t('subscriptionExpired')}
                </span>
              </Link>
            )}

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
              <Moon className="h-[1.2rem] w-[1.2rem] hidden dark:block" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Globe className="h-5 w-5" />
              <span className="sr-only">{language.toUpperCase()}</span>
            </Button>

            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>

                {user.role === 'viewer' && (
                  <Link to="/subscription">
                    <Button variant="ghost" size="icon">
                      <CreditCard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>{t('signOut')}</span>
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>{t('signIn')}</span>
              </Button>
            )}
          </div>

          {/* Small Screens */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin-cash-requests')}>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      {t('cashRequests')}
                      {pendingCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin-users')}>
                      <Users className="w-4 h-4 mr-2" />
                      {t('users')}
                    </DropdownMenuItem>
                  </>
                )}

                {user?.role === 'viewer' && (
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('mySubscription')}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={toggleLanguage}>
                  <Globe className="w-4 h-4 mr-2" />
                  {language.toUpperCase()}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleTheme}>
                  <Sun className="w-4 h-4 mr-2" />
                  {t('theme')}
                </DropdownMenuItem>

                {user && (
                  <DropdownMenuItem disabled>
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={user ? handleSignOut : () => navigate('/dashboard')}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {user ? t('signOut') : t('signIn')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
