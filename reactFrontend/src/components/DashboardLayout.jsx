import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo, SvgIcon } from './ui';
import { bookingPageUrl, initials } from '../utils/format';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Profile', href: '/dashboard/profile' },
  { name: 'Services', href: '/dashboard/services' },
  { name: 'Availability', href: '/dashboard/availability' },
  { name: 'Bookings', href: '/dashboard/bookings' },
  { name: 'Payments', href: '/dashboard/payments' },
];

const DashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href) =>
    href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa]">
      <header className="sticky top-0 z-30 border-b border-slate-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl p-2 text-slate-600 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <SvgIcon name={menuOpen ? 'close' : 'menu'} />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {initials(user?.businessName || user?.name)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-[160px] truncate text-sm font-bold text-slate-800">
                    {user?.businessName || user?.name || 'Your business'}
                  </p>
                </div>
                <SvgIcon name="chevron" className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  {user?.slug && (
                    <a
                      href={bookingPageUrl(user.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <SvgIcon name="external" className="h-4 w-4" />
                      View booking page
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <SvgIcon name="logout" className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    isActive(item.href) ? 'bg-violet-100 text-violet-700' : 'text-slate-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
