import { Link } from "react-router-dom";
import { useTranslation } from "../../node_modules/react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-100 border-t mt-16 py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-600">
        <div className="space-y-2 text-center md:text-left">
          <p className="font-bold text-gray-900 tracking-wide uppercase text-xs">
            {t('footer.copyright')}
          </p>
          <p className="opacity-60 italic">
            {t('footer.description')}
          </p>
        </div>
        
        <div className="flex gap-8 font-black uppercase tracking-tighter text-xs">
          <Link to="/faq" className="hover:text-blue-600 transition-colors">
            {t('footer.faq')}
          </Link>
          <Link to="/policy" className="hover:text-blue-600 transition-colors">
            {t('footer.policy')}
          </Link>
        </div>
        
        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
          {t('footer.version', { current: '1.0.4-LTS' })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;