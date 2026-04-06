import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthFeature } from "../features/auth/hooks";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login: executeLogin, loading, error } = useAuthFeature();
  const { saveSession } = useAuth(); // We still need global session management
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: any } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await executeLogin(email, password);
      // Update global context with session data
      saveSession(data.user, data.accessToken, data.refreshToken);
      
      let redirectTo = "/";
      if (data.user.role === "admin" || data.user.role === "staff") {
        redirectTo = "/admin";
      } else if (location.state?.from?.pathname && location.state.from.pathname !== "/login") {
        redirectTo = location.state.from.pathname;
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Error handled by hook's toast
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-2">{t('login.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('login.subtitle')}</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t('login.email')}</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t('login.password')}</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" size="sm" color="blue" className="text-sm text-blue-600 hover:underline">
              {t('login.forgotPassword')}
            </Link>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-lg disabled:opacity-60 hover:bg-blue-700 transition">
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;