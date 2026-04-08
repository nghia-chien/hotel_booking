import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  DollarSign,
  Percent,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "../../api/admin.api";
import { cn } from "../../components/ui/utils";
import { StatusBadge, AdminPageHeader } from "../../components/admin";

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        if (response.success) {
          setStats(response.data);
        } else {
          setError(t('admin.dashboard.error.loadFailed'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.dashboard.error.generic'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex flex-col items-center">
        <p className="font-medium">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white rounded-lg text-sm font-semibold shadow-sm border border-red-200 hover:bg-red-50 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <AdminPageHeader
        eyebrow={t('admin.dashboard.eyebrow')}
        title={t('admin.dashboard.pageTitle')}
        subtitle={t('admin.dashboard.subtitle')}
        actions={
          <Link
            to="/admin/calendar"
            className="px-4 py-2.5 bg-[var(--color-surface)] hover:bg-gray-200 text-[var(--color-text-primary)] text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            {t('admin.dashboard.viewCalendar')} <ChevronRight className="w-4 h-4" />
          </Link>
        }
      />

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={t('admin.dashboard.kpi.todayBookings.title')}
          value={stats.todayBookings}
          icon={<Clock className="w-5 h-5" />}
          description={t('admin.dashboard.kpi.todayBookings.desc')}
        />
        <KPICard
          title={t('admin.dashboard.kpi.todayRevenue.title')}
          value={`${stats.todayRevenue.toLocaleString()} VND`}
          icon={<DollarSign className="w-5 h-5" />}
          description={t('admin.dashboard.kpi.todayRevenue.desc')}
          highlight
        />
        <KPICard
          title={t('admin.dashboard.kpi.occupancy.title')}
          value={`${stats.occupancyRate}%`}
          icon={<Percent className="w-5 h-5" />}
          description={t('admin.dashboard.kpi.occupancy.desc')}
        />
        <KPICard
          title={t('admin.dashboard.kpi.pending.title')}
          value={stats.pendingBookings}
          icon={<Users className="w-5 h-5" />}
          description={t('admin.dashboard.kpi.pending.desc')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Row 2: Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('admin.dashboard.chart.title')}</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium italic">{t('admin.dashboard.chart.unit')}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
              <span className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{t('admin.dashboard.chart.totalRevenue')}</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.last7DaysRevenue}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  cursor={{ stroke: "#C8F000", strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                    padding: "12px 18px",
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}
                  labelStyle={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} VND`, t('admin.dashboard.chart.tooltipLabel')]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={4}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: "#C8F000", stroke: "#111827", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Actions / Info */}
        <div className="bg-white p-8 rounded-3xl shadow-[var(--shadow-sm)] border border-[var(--color-border)] flex flex-col">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 border-b border-[var(--color-border)] pb-4">
            {t('admin.dashboard.analysis.title')}
          </h3>

          <div className="mt-8 p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('admin.dashboard.analysis.adviceLabel')}</p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
              {t('admin.dashboard.analysis.adviceContent')}
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Bookings Table */}
      <div className="bg-white rounded-3xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            {t('admin.dashboard.recentBookings.title')}
          </h2>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)] transition-colors flex items-center gap-2 group"
          >
            {t('admin.dashboard.recentBookings.viewAll')} <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)]">
                <th className="px-8 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">{t('admin.dashboard.recentBookings.table.customer')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">{t('admin.dashboard.recentBookings.table.room')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">{t('admin.dashboard.recentBookings.table.status')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] text-right">{t('admin.dashboard.recentBookings.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
              {stats.recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-semibold">{booking.guestName}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-mono tracking-tighter mt-0.5">#{booking.id}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-white border border-[var(--color-border)] rounded-md text-xs font-bold">
                      {t('admin.dashboard.recentBookings.roomPrefix', { number: booking.room })}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link
                      to={`/admin/bookings?id=${booking.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-primary)] hover:underline decoration-[var(--color-primary)] decoration-2 underline-offset-4"
                    >
                      {t('admin.dashboard.recentBookings.detail')} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, description, highlight }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "p-6 rounded-3xl transition-all duration-300 border",
      highlight
        ? "bg-[var(--color-primary)] border-transparent shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
        : "bg-white border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:border-gray-300"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-xl flex items-center justify-center",
          highlight ? "bg-black/10 text-black" : "bg-[var(--color-surface)] text-[var(--color-text-primary)]"
        )}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          highlight ? "text-black/60" : "text-[var(--color-text-muted)]"
        )}>
          {title}
        </p>
        <h3 className={cn(
          "text-2xl font-bold",
          highlight ? "text-black" : "text-[var(--color-text-primary)]"
        )}>
          {value}
        </h3>
        {description && (
          <p className={cn(
            "text-[10px] mt-2",
            highlight ? "text-black/50" : "text-[var(--color-text-secondary)]"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

