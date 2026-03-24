import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../components/ui/utils";
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Loader2,
  Mail,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "staff";
  isActive: boolean;
  createdAt: string;
}

interface UserListResponse {
  success: boolean;
  data: User[];
  totalCount: number;
  page: number;
  limit: number;
}

const RoleBadge = ({ role }: { role: string }) => {
  const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    admin: { bg: "bg-purple-50", text: "text-purple-700", icon: ShieldAlert, label: "Quản trị viên" },
    staff: { bg: "bg-blue-50", text: "text-blue-700", icon: ShieldCheck, label: "Nhân viên" },
    user: { bg: "bg-gray-50", text: "text-gray-700", icon: Shield, label: "Khách hàng" },
  };
  const config = configs[role] || configs.user;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-transparent transition-colors",
      config.bg,
      config.text
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<UserListResponse>(
        `/api/admin/users?page=${page}&limit=${limit}&search=${search}`,
        "GET",
        undefined,
        { auth: true }
      );
      setUsers(res.data);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (updatingId) return;
    setUpdatingId(userId);
    try {
      await apiRequest(`/api/admin/users/${userId}/role`, "PATCH", { role: newRole }, { auth: true });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    if (updatingId) return;
    setUpdatingId(userId);
    try {
      await apiRequest(`/api/admin/users/${userId}/status`, "PATCH", { isActive: !currentStatus }, { auth: true });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 block">
            Quản trị nhân sự
          </span>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
            Tài khoản người dùng
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-3 max-w-md leading-relaxed">
            Phân quyền hệ thống, quản lý trạng thái hoạt động và thông tin cơ bản của người dùng.
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary-dark)] transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm theo họ tên hoặc địa chỉ email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 h-[48px] bg-[var(--color-surface)] border-none rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] transition-all outline-none shadow-inner"
          />
        </div>
        <div className="flex items-center gap-4 bg-[var(--color-surface)] px-5 rounded-xl border border-[var(--color-border)]">
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Sắp xếp:</span>
           <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Mặc định (Mới nhất)</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Thành viên</th>
                <th className="px-8 py-5">Phân quyền</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5">Thông tin đăng ký</th>
                <th className="px-8 py-5 text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
              {users.map((u) => {
                const isSelf = u._id === currentUser?.id;
                return (
                  <tr key={u._id} className="hover:bg-[var(--color-surface)]/40 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-[18px] flex items-center justify-center text-sm font-black border border-[var(--color-border)] shadow-sm transition-transform group-hover:scale-110",
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'staff' ? 'bg-blue-100 text-blue-700' : 
                          'bg-[var(--color-primary)] text-black'
                        )}>
                          {getInitials(u.fullName)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm tracking-tight flex items-center gap-2">
                             {u.fullName} {isSelf && <span className="text-[8px] bg-black text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">TÔI</span>}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 focus:text-[var(--color-primary-dark)]">
                             <Mail className="w-3 h-3" /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block group/select">
                        <select 
                          disabled={isSelf || updatingId === u._id}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                          className={cn(
                            "appearance-none text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 border border-transparent focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer disabled:cursor-not-allowed transition-all",
                            u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 
                            u.role === 'staff' ? 'bg-blue-50 text-blue-700' : 
                            'bg-gray-50 text-gray-700'
                          )}
                        >
                          <option value="user">USER</option>
                          <option value="staff">STAFF</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <StatusBadge isActive={u.isActive} onClick={() => handleStatusToggle(u._id, u.isActive)} disabled={isSelf || !!updatingId} />
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
                             <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                             {format(new Date(u.createdAt), "dd MMM, yyyy")}
                          </div>
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase ml-5 tracking-tighter">
                             At {format(new Date(u.createdAt), "HH:mm")}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {updatingId === u._id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary-dark)] ml-auto" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button 
                            disabled={isSelf}
                            onClick={() => handleStatusToggle(u._id, u.isActive)}
                            className={cn(
                              "p-3 rounded-xl transition-all border border-transparent hover:shadow-sm",
                              u.isActive 
                                ? "text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 hover:border-red-100" 
                                : "text-[var(--color-text-muted)] hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100",
                              isSelf && "opacity-0"
                            )}
                            title={u.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                          >
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="py-24 text-center group">
            <div className="p-8 bg-[var(--color-surface)] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Dữ liệu trống</h3>
            <p className="text-[var(--color-text-secondary)] text-sm mt-2 font-medium italic">Không tìm thấy bất kỳ người dùng nào khớp với từ khóa "{search}".</p>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-8 py-8 bg-[var(--color-surface)]/50 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Showing page {page} of {totalPages} <span className="text-[var(--color-text-primary)] ml-2 opacity-50">/</span> Total {totalCount} members
            </span>
            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-[var(--color-border)] shadow-sm hover:border-black disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-[10px] font-black transition-all",
                      page === i + 1 
                        ? "bg-black text-white shadow-xl shadow-black/10 scale-110" 
                        : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-black"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-[var(--color-border)] shadow-sm hover:border-black disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ isActive, onClick, disabled }: { isActive: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
        isActive 
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
          : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500")}></div>
      {isActive ? "Đang hoạt động" : "Đã vô hiệu"}
    </button>
  );
}
