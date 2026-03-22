import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Lock, 
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CreditCard
} from "lucide-react";

type ProfileFields = {
  fullName: string;
  phone: string;
  address: string;
};

type PasswordFields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const { user, updateProfile, changePassword, uploadAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFields>({
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFields>();

  const newPassword = watch("newPassword");

  const onProfileSubmit = async (data: ProfileFields) => {
    setProfileMsg(null);
    try {
      await updateProfile(data);
      setProfileMsg({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: (err as Error).message });
    }
  };

  const onPasswordSubmit = async (data: PasswordFields) => {
    setPasswordMsg(null);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      resetPasswordForm();
    } catch (err) {
      setPasswordMsg({ type: "error", text: (err as Error).message });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (!user) return null;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const avatarUrl = user.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 shadow-inner">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              getInitials(user.fullName)
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-transform active:scale-95">
            <Camera className="w-5 h-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
          </label>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 items-center md:items-start justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
              <span className="flex items-center gap-1.5 capitalize"><ShieldCheck className="w-4 h-4" /> {user.role}</span>
            </div>
          </div>
          <Link 
            to="/payment-history"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-sm"
          >
            <CreditCard className="w-4 h-4" />
            Lịch sử thanh toán
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...regProfile("fullName", { required: "Họ tên là bắt buộc" })}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {profileErrors.fullName && <p className="text-xs text-red-500">{profileErrors.fullName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...regProfile("phone")}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="0987 654 321"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...regProfile("address")}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Số 1 Đại Cồ Việt, Hà Nội"
                />
              </div>
            </div>

            {profileMsg && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                profileMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProfileSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Lưu thay đổi
            </button>
          </form>
        </section>

        {/* Change Password Section */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
              <input
                type="password"
                {...regPassword("currentPassword", { required: "Vui lòng nhập mật khẩu hiện tại" })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
              {passwordErrors.currentPassword && <p className="text-xs text-red-500">{passwordErrors.currentPassword.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <input
                type="password"
                {...regPassword("newPassword", { 
                  required: "Vui lòng nhập mật khẩu mới",
                  minLength: { value: 6, message: "Mật khẩu phải từ 6 ký tự" }
                })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
              {passwordErrors.newPassword && <p className="text-xs text-red-500">{passwordErrors.newPassword.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                {...regPassword("confirmPassword", { 
                  required: "Vui lòng xác nhận mật khẩu mới",
                  validate: (val) => val === newPassword || "Mật khẩu xác nhận không khớp"
                })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
              {passwordErrors.confirmPassword && <p className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>}
            </div>

            {passwordMsg && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {passwordMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md shadow-gray-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPasswordSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Đổi mật khẩu
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
