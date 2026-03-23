import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Search,
  LayoutDashboard,
  ShieldCheck,
  Star,
  BarChart3,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { cn } from './ui/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
      if (adminMenuRef.current && !adminMenuRef.current.contains(target)) setIsAdminOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-foreground)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <span className="font-serif font-bold text-lg text-[var(--color-text-primary)] tracking-tight">
            HotelBooking
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {/* <NavLinkItem to="/">Trang chủ</NavLinkItem> */}
          <NavLinkItem to="/rooms">Tìm phòng</NavLinkItem>
          
          {user && !isStaffOrAdmin && <NavLinkItem to="/my-bookings">Booking của tôi</NavLinkItem>}
          
          {isStaffOrAdmin && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
              >
                Quản lý
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isAdminOpen && "rotate-180")} />
              </button>
              
              {isAdminOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-2 z-50">
                  <DropdownLink to="/admin/bookings" icon={LayoutDashboard} onClick={() => setIsAdminOpen(false)}>Quản lý booking</DropdownLink>
                  <DropdownLink to="/admin/room-types" icon={ShieldCheck} onClick={() => setIsAdminOpen(false)}>Loại phòng</DropdownLink>
                  <DropdownLink to="/admin/rooms" icon={Building2} onClick={() => setIsAdminOpen(false)}>Phòng</DropdownLink>
                  <DropdownLink to="/admin/pricing-rules" icon={Calendar} onClick={() => setIsAdminOpen(false)}>Giá theo mùa</DropdownLink>
                  <DropdownLink to="/admin/reviews" icon={Star} onClick={() => setIsAdminOpen(false)}>Đánh giá</DropdownLink>
                  <DropdownLink to="/admin/calendar" icon={Calendar} onClick={() => setIsAdminOpen(false)}>Lịch phòng</DropdownLink>
                  <DropdownLink to="/admin/reports" icon={BarChart3} onClick={() => setIsAdminOpen(false)}>Báo cáo</DropdownLink>
                  {user?.role === 'admin' && (
                    <>
                      <div className="h-px bg-[var(--color-border)] my-1 mx-2" />
                      <DropdownLink to="/admin/users" icon={Users} onClick={() => setIsAdminOpen(false)}>Quản lý user</DropdownLink>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {/* {user && <NavLinkItem to="/profile">Hồ sơ</NavLinkItem>} */}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              <NotificationBell />
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-foreground)] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)] hidden sm:block max-w-[100px] truncate">
                    {user.fullName.split(' ').at(-1)}
                  </span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user.fullName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-1">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <DropdownLink to="/my-bookings" icon={Calendar} onClick={() => setUserMenuOpen(false)}>Booking của tôi</DropdownLink>
                      <DropdownLink to="/profile" icon={User} onClick={() => setUserMenuOpen(false)}>Hồ sơ</DropdownLink>
                    </div>
                    <div className="py-1 border-t border-[var(--color-border)]">
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer">
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 md:gap-2">
              <Link to="/login" className="px-3 py-2 text-sm font-medium rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors">Đăng nhập</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-bold rounded-lg bg-[var(--color-primary-foreground)] text-white hover:opacity-90 transition-opacity shadow-sm">Đăng ký</Link>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors cursor-pointer text-[var(--color-text-primary)]">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-4 py-4 space-y-1 animate-in slide-in-from-top duration-200">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>Trang chủ</MobileLink>
          <MobileLink to="/rooms" onClick={() => setMobileOpen(false)}>Tìm phòng</MobileLink>
          {user && (
            <>
              <MobileLink to="/my-bookings" onClick={() => setMobileOpen(false)}>Booking của tôi</MobileLink>
              <MobileLink to="/profile" onClick={() => setMobileOpen(false)}>Hồ sơ</MobileLink>
              {isStaffOrAdmin && (
                <>
                  <p className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] mt-2">Hệ thống Quản lý</p>
                  <MobileLink to="/admin/bookings" onClick={() => setMobileOpen(false)}>Quản lý booking</MobileLink>
                  <MobileLink to="/admin/room-types" onClick={() => setMobileOpen(false)}>Loại phòng</MobileLink>
                  <MobileLink to="/admin/rooms" onClick={() => setMobileOpen(false)}>Phòng</MobileLink>
                  <MobileLink to="/admin/pricing-rules" onClick={() => setMobileOpen(false)}>Giá theo mùa</MobileLink>
                  <MobileLink to="/admin/reviews" onClick={() => setMobileOpen(false)}>Đánh giá</MobileLink>
                  <MobileLink to="/admin/calendar" onClick={() => setMobileOpen(false)}>Lịch phòng</MobileLink>
                  <MobileLink to="/admin/reports" onClick={() => setMobileOpen(false)}>Báo cáo</MobileLink>
                  {user.role === 'admin' && <MobileLink to="/admin/users" onClick={() => setMobileOpen(false)}>Quản lý user</MobileLink>}
                </>
              )}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </>
          )}
          {!user && (
            <div className="flex flex-col gap-2 pt-4">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold border border-[var(--color-border)] text-[var(--color-text-primary)]">Đăng nhập</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-[var(--color-primary-foreground)] text-white">Đăng ký</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

const NavLinkItem = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-all duration-200">
    {children}
  </Link>
);

const DropdownLink = ({ to, icon: Icon, children, onClick }: { to: string; icon: LucideIcon; children: ReactNode; onClick?: () => void }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors group">
    <Icon className="w-4 h-4 flex-shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]" />
    {children}
  </Link>
);

const MobileLink = ({ to, children, onClick }: { to: string; children: ReactNode; onClick: () => void }) => (
  <Link to={to} onClick={onClick} className="block px-3 py-2.5 rounded-lg text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors">
    {children}
  </Link>
);