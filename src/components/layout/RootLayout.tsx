import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { BookOpen, UserCircle, LogOut, Menu, Bell } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function RootLayout() {
  const { user } = useAuth();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await api.get('/cases');
      return res.data;
    },
    enabled: user?.role === 'TUTOR',
  });

  const invitationsCount = data?.cases?.filter((c: any) => c.status === 'OPEN').length || 0;

  const handleLogout = () => {
    // In a real app, also call API to invalidate cookie
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-primary-DEFAULT hover:text-primary-hover transition-colors">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">TuitionMatch</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
                {user.role === 'PARENT' ? (
                  <>
                    <Link to="/dashboard" className="hover:text-primary-DEFAULT transition-colors">My Cases</Link>
                    <Link to="/tutors" className="hover:text-primary-DEFAULT transition-colors">Find Tutors</Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="hover:text-primary-DEFAULT transition-colors">Invited Cases</Link>
                    <Link to="/profile" className="hover:text-primary-DEFAULT transition-colors">My Profile</Link>
                  </>
                )}
              </nav>
            )}
            
            <div className="flex items-center gap-4 border-l pl-4 border-slate-200">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === 'TUTOR' && (
                    <Link to="/dashboard" className="relative text-slate-500 hover:text-slate-900 transition-colors">
                      <Bell className="h-5 w-5" />
                      {invitationsCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {invitationsCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <UserCircle className="h-5 w-5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                  <Button size="sm" onClick={() => navigate('/register')}>Sign Up</Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-500 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg">
            {user ? (
              <>
                <div className="text-sm text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  {user.email}
                </div>
                <nav className="flex flex-col gap-3 font-medium text-slate-700">
                  {user.role === 'PARENT' ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>My Cases</Link>
                      <Link to="/tutors" onClick={() => setIsMobileMenuOpen(false)}>Find Tutors</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Invited Cases</Link>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="text-left text-red-600 font-medium pt-2">Logout</button>
                </nav>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-center" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Login</Button>
                <Button className="w-full justify-center" onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}>Sign Up</Button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-200 py-6 bg-white mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} TuitionMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
