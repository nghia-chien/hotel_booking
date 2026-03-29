import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    setLoading(true);
    try {
      await apiRequest("/api/auth/reset-password", "POST", {
        token,
        newPassword
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl p-8 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">t('resetpassword.title').</h2>
        <p className="text-sm text-gray-500">
          Dán token reset và đặt mật khẩu mới.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1 text-gray-700">Token</label>
          <input
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="reset token"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">
            Mật khẩu mới
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {done && (
          <p className="text-green-700 text-sm">
            Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-lg disabled:opacity-60 hover:bg-blue-700 transition"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>

      <div className="text-sm text-gray-600">
        <Link to="/login" className="text-blue-600 hover:underline">
          Về đăng nhập
        </Link>
      </div>
    </div>
  );
}

