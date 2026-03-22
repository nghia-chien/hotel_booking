import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Loader2,
  Filter
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
  const configs: Record<string, { color: string; icon: any; label: string }> = {
    admin: { color: "bg-purple-100 text-purple-700", icon: ShieldAlert, label: "Admin" },
    staff: { color: "bg-blue-100 text-blue-700", icon: ShieldCheck, label: "Staff" },
    user: { color: "bg-gray-100 text-gray-700", icon: Shield, label: "User" },
  };
  const config = configs[role] || configs.user;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm">Quản trị danh sách người dùng, cấp quyền và trạng thái tài khoản.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 bg-gray-50 border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Sắp xếp: Mới nhất</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 border-2 border-white shadow-sm overflow-hidden">
                          {getInitials(u.fullName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {u.fullName} {isSelf && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded ml-1 font-black">BẠN</span>}
                          </span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        disabled={isSelf || updatingId === u._id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`text-xs font-bold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:cursor-not-allowed ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'staff' ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        disabled={isSelf || updatingId === u._id}
                        onClick={() => handleStatusToggle(u._id, u.isActive)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          u.isActive 
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        } disabled:opacity-50`}
                      >
                        {u.isActive ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Hoạt động
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Vô hiệu
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(u.createdAt), "dd/MM/yyyy")}
                      <div className="text-[10px] text-gray-400 uppercase font-bold">{format(new Date(u.createdAt), "HH:mm")}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {updatingId === u._id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600 ml-auto" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button 
                            disabled={isSelf}
                            onClick={() => handleStatusToggle(u._id, u.isActive)}
                            className={`p-2 rounded-lg transition-colors ${u.isActive ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-emerald-50 text-gray-400 hover:text-emerald-500"} disabled:opacity-0`}
                            title={u.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
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
          <div className="p-12 text-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto opacity-50">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-900 font-bold">Không tìm thấy người dùng nào</p>
              <p className="text-gray-400 text-sm">Thử từ khóa tìm kiếm khác.</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Trang {page} / {totalPages} (Tổng {totalCount})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      page === i + 1 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                        : "bg-white border border-gray-100 text-gray-500 hover:border-blue-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 transition-all"
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
