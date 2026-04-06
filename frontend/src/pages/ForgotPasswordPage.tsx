import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from '../../node_modules/react-i18next';
import { apiRequest } from "../api/client";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetToken(null);
    setLoading(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        data?: { resetToken: string };
        message?: string;
      }>("/api/auth/forgot-password", "POST", { email });

      if (res.data?.resetToken) setResetToken(res.data.resetToken);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl p-8 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('forgotPassword.title')}</h2>
        <p className="text-sm text-gray-500">
          {t('forgotPassword.mockInstruction')}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t('forgotPassword.email')}</label>
          <input
            type="email"
            placeholder={t('forgotPassword.placeholder')}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-lg disabled:opacity-60 hover:bg-blue-700 transition"
        >
          {loading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
        </button>
      </form>

      {resetToken && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold mb-1">{t('forgotPassword.mockTokenLabel')}</p>
          <code className="break-all">{resetToken}</code>
          <div className="mt-3">
            <Link
              to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              className="text-blue-700 hover:underline"
            >
              {t('forgotPassword.goToReset')}
            </Link>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <Link to="/login" className="text-blue-600 hover:underline">
          {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </div>
  );
}