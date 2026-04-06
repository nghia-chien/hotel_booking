import { useNavigate } from "react-router-dom";
import { useTranslation } from '../../node_modules/react-i18next';
import { Button } from "../components/ui/button";

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-xl mx-auto bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-[#1F1F1F] mb-2">{t('payments.cancel')}</h1>
      <p className="text-sm text-black/60">{t('payments.cancelMsg')}</p>
      <div className="mt-4 flex gap-2">
        <Button className="bg-[#2C2C2C] hover:bg-black text-white rounded-xl" onClick={() => navigate("/my-bookings")}>
          {t('payments.backToBookings')}
        </Button>
        <Button variant="outline" className="rounded-xl border-[#E8DFD8] bg-white hover:bg-[#F5F1ED]" onClick={() => navigate("/rooms")}>
          {t('roomDetail.backToSearch')}
        </Button>
      </div>
    </div>
  );
}

