import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../../api/client";
import { cn } from "../../components/ui/utils";
import { 
  Star, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  Quote
} from "lucide-react";
import { format } from "date-fns";

interface Review {
  _id: string;
  user: { fullName: string; email: string };
  room: { roomNumber: string };
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

interface ReviewListResponse {
  success: boolean;
  data: Review[];
  totalCount: number;
  page: number;
  limit: number;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<ReviewListResponse>(
        `/api/reviews/admin/all?page=${page}&limit=${limit}`,
        "GET",
        undefined,
        { auth: true }
      );
      setReviews(res.data);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const handleToggleVisibility = async (reviewId: string, currentStatus: boolean) => {
    setUpdatingId(reviewId);
    try {
      await apiRequest(
        `/api/reviews/admin/${reviewId}/visibility`,
        "PATCH",
        { isVisible: !currentStatus },
        { auth: true }
      );
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, isVisible: !currentStatus } : r));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-500 pb-20 mt-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 block">
            Kiểm duyệt nội dung
          </span>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
            Đánh giá & Phản hồi
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-3 max-w-md leading-relaxed">
            Xem xét các trải nghiệm của khách hàng và quản lý hiển thị các bài đánh giá trên trang chủ.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--color-surface)] px-5 py-3 rounded-2xl border border-[var(--color-border)]">
            <MessageSquare className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">Tổng soát: {totalCount} lượt feedback</span>
        </div>
      </header>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Khách hàng</th>
                <th className="px-8 py-5">Sản phẩm</th>
                <th className="px-8 py-5">Xếp hạng</th>
                <th className="px-8 py-5">Nội dung bài viết</th>
                <th className="px-8 py-5 text-center">Kiểm duyệt</th>
                <th className="px-8 py-5 text-right">Ẩn/Hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-[var(--color-surface)]/40 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-xs font-black text-gray-400 shadow-sm group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm tracking-tight group-hover:text-[var(--color-primary-dark)] transition-colors">
                           {r.user?.fullName}
                        </span>
                        <span className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{r.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[10px] font-black uppercase tracking-tighter">
                       <Home className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> Room {r.room?.roomNumber}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50">
                      <span className="text-xs font-black text-amber-700">{r.rating}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shadow-sm" />
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-sm">
                    <div className="relative pl-6">
                       <Quote className="absolute left-0 top-0 w-4 h-4 text-[var(--color-primary)] opacity-40 rotate-180" />
                       <p className="text-xs text-[var(--color-text-secondary)] font-medium italic leading-relaxed line-clamp-2">
                          {r.comment || "Không có nội dung nhận xét."}
                       </p>
                    </div>
                    <div className="mt-2 ml-6 text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                       {format(new Date(r.createdAt), "dd/MM/yyyy · HH:mm")}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                      r.isVisible 
                       ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                       : "bg-gray-100 text-gray-400 border-gray-200"
                    )}>
                       <div className={cn("w-1.5 h-1.5 rounded-full", r.isVisible ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-400")}></div>
                       {r.isVisible ? "Công khai" : "Đã ẩn"}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {updatingId === r._id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary-dark)] ml-auto" />
                    ) : (
                      <button 
                        onClick={() => handleToggleVisibility(r._id, r.isVisible)}
                        className={cn(
                          "p-3 rounded-2xl transition-all border border-transparent shadow-sm",
                          r.isVisible 
                           ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-100" 
                           : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"
                        )}
                        title={r.isVisible ? "Ẩn bài viết" : "Công khai bài viết"}
                      >
                        {r.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-6">
               <MessageSquare className="w-10 h-10 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Danh sách trống</h3>
            <p className="text-[var(--color-text-secondary)] text-sm font-medium italic mt-2">Hiện chưa có khách hàng nào gửi đánh giá cho hệ thống.</p>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-8 py-8 bg-[var(--color-surface)]/50 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Showing page {page} of {totalPages} <span className="text-[var(--color-text-primary)] mx-2 opacity-50">/</span> {totalCount} total reviews
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
