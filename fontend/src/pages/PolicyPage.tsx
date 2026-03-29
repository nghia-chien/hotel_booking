import { ShieldCheck, BookOpen, Clock, Archive } from "lucide-react";
import { useTranslation } from "react-i18next";
const PolicySection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => {
  
  return (
    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 hover:shadow-xl hover:scale-[1.01] transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
      <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900 leading-none">
        <Icon className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-xl" />
        {title}
      </h2>
      <div className="space-y-4 text-gray-600 leading-relaxed text-sm lg:text-base relative z-10 pl-11">
        {children}
      </div>
    </section>
  );
};

export default function PolicyPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
          <BookOpen className="w-4 h-4" /> {t('policy.badge')}
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('policy.pageTitle')}</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed italic">
          {t('policy.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <PolicySection title={t('policy.booking.title')} icon={Clock}>
          <ul className="list-disc space-y-3">
            <li>{t('policy.booking.point1')}</li>
            <li>
              {t('policy.booking.point2_part1')} <span className="font-bold text-blue-600">{t('policy.booking.point2_highlight')}</span> {t('policy.booking.point2_part2')}
            </li>
            <li>{t('policy.booking.point3')}</li>
          </ul>
        </PolicySection>

        <PolicySection title={t('policy.cancellation.title')} icon={ShieldCheck}>
          <div className="space-y-4 bg-red-50/30 p-6 rounded-2xl border border-red-100">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
              <p><span className="font-bold text-gray-900">{t('policy.cancellation.before24h_label')}</span> {t('policy.cancellation.before24h_text')}</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
              <p><span className="font-bold text-gray-900">{t('policy.cancellation.within24h_label')}</span> {t('policy.cancellation.within24h_text')}</p>
            </div>
            <div className="flex items-start gap-4 border-t border-red-100 pt-4">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
              <p><span className="font-bold text-gray-900 italic">{t('policy.cancellation.noShow_label')}</span> {t('policy.cancellation.noShow_text')}</p>
            </div>
          </div>
        </PolicySection>

        <PolicySection title={t('policy.checkInOut.title')} icon={Archive}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-2xl outline outline-1 outline-blue-100/50">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <span className="text-xs font-black uppercase tracking-widest text-blue-500">{t('policy.checkInOut.checkInLabel')}</span>
              <p className="text-2xl font-bold mt-1">{t('policy.checkInOut.checkInTime')}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm text-right md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-blue-500">{t('policy.checkInOut.checkOutLabel')}</span>
              <p className="text-2xl font-bold mt-1">{t('policy.checkInOut.checkOutTime')}</p>
            </div>
          </div>
          <p className="mt-4 italic text-sm">
            {t('policy.checkInOut.note_part1')} <span className="font-bold text-blue-600">{t('policy.checkInOut.note_highlight')}</span> {t('policy.checkInOut.note_part2')}
          </p>
        </PolicySection>

        {/* Chú ý: Dùng lại t('policy.title') vì trong file i18n của bạn đã có sẵn key này mang nghĩa "Chính sách bảo mật" */}
        <PolicySection title={t('policy.title')} icon={ShieldCheck}>
          <p>{t('policy.privacy.intro')}</p>
          <ul className="list-disc space-y-3 mt-3">
            <li>{t('policy.privacy.point1')}</li>
            <li>{t('policy.privacy.point2')}</li>
            <li>{t('policy.privacy.point3')}</li>
          </ul>
        </PolicySection>
      </div>
    </div>
  );
}
