import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuthFeature } from "../features/auth/hooks";

const RegisterPage = () => {
  const { register, loading, error } = useAuthFeature();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(fullName, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-2">{t('register.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('register.subtitle')}</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t('register.fullName')}</label>
          <input type="text" placeholder="Nguyễn Văn A" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t('register.email')}</label>
          <input type="email" placeholder="you@example.com" className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t('register.password')}</label>
          <input type="password" placeholder={t('register.passwordHint')} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-lg disabled:opacity-60 hover:bg-blue-700 transition">
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
