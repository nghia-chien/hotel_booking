import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../../api/client";
import { 
  Star, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Home
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-500 text-sm">Xem và kiểm duyệt các đánh giá từ khách hàng.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Phòng</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Nhận xét</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{r.user?.fullName}</span>
                        <span className="text-[10px] text-gray-400">{r.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-gray-600 uppercase text-xs">
                       <Home className="w-3.5 h-3.5 text-gray-400" /> #{r.room?.roomNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2 italic leading-relaxed">"{r.comment}"</p>
                    <span className="text-[10px] text-gray-400">{format(new Date(r.createdAt), "dd/MM/yyyy HH:mm")}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${r.isVisible ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                       {r.isVisible ? "Hiển thị" : "Bị ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {updatingId === r._id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 ml-auto" />
                    ) : (
                      <button 
                        onClick={() => handleToggleVisibility(r._id, r.isVisible)}
                        className={`p-2 rounded-xl transition-all ${r.isVisible ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"}`}
                        title={r.isVisible ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
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
          <div className="p-12 text-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto opacity-50 text-gray-400">
               <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Chưa có đánh giá nào</p>
              <p className="text-gray-400 text-sm">Dữ liệu đánh giá sẽ xuất hiện khi có khách hàng feedback.</p>
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
