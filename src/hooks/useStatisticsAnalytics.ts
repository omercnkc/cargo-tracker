import { useMemo, useState } from 'react';
import { resolveShipmentCarrier } from '../constants/carriers';

export const COURIER_CHART_COLORS = [
  '#3B82F6', // Vibrant Blue
  '#10B981', // Emerald Green
  '#F59E0B', // Warm Amber / Orange
  '#8B5CF6', // Purple / Violet
  '#EC4899', // Pink / Rose
  '#06B6D4', // Cyan / Teal
  '#F97316', // Deep Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#EAB308', // Yellow
];

export interface MonthlyBarItem {
  month: string;
  fullLabel: string;
  value: number;
  year: number;
  monthIdx: number;
  key: string;
  height: string;
  isSelected: boolean;
}

export interface CourierBreakdownItem {
  label: string;
  count: number;
  pct: string;
  fraction: number;
  color: string;
}

export const useStatisticsAnalytics = (shipmentsData: any[] | undefined, language: string) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  const shipments = useMemo(() => shipmentsData || [], [shipmentsData]);

  // Monthly Bar Chart Data (Last 12 Months)
  const monthlyBarData = useMemo<MonthlyBarItem[]>(() => {
    const months: { month: string; value: number; year: number; monthIdx: number; key: string; fullLabel: string }[] = [];
    const now = new Date();
    const locale = language === 'en' ? 'en-US' : 'tr-TR';

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthShort = d.toLocaleDateString(locale, { month: 'short' });
      const monthLong = d.toLocaleDateString(locale, { month: 'long' });
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const key = `${year}-${monthIdx}`;

      months.push({
        month: monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
        fullLabel: `${monthLong.charAt(0).toUpperCase() + monthLong.slice(1)} ${year}`,
        value: 0,
        year,
        monthIdx,
        key,
      });
    }

    shipments.forEach((s) => {
      if (s.created_at) {
        const date = new Date(s.created_at);
        const sYear = date.getFullYear();
        const sMonth = date.getMonth();
        const found = months.find((m) => m.year === sYear && m.monthIdx === sMonth);
        if (found) {
          found.value += 1;
        }
      }
    });

    const maxValue = Math.max(...months.map((m) => m.value), 1);

    return months.map((m) => ({
      ...m,
      height: `${Math.max(m.value > 0 ? (m.value / maxValue) * 100 : 8, 8)}%`,
      isSelected: selectedMonthKey === m.key,
    }));
  }, [shipments, selectedMonthKey, language]);

  // Selected Month Label
  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonthKey) return null;
    const found = monthlyBarData.find((m) => m.key === selectedMonthKey);
    return found ? found.fullLabel : null;
  }, [selectedMonthKey, monthlyBarData]);

  // Filtered Shipments based on Selected Month
  const filteredShipments = useMemo(() => {
    if (!selectedMonthKey) return shipments;
    const [yearStr, monthStr] = selectedMonthKey.split('-');
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10);

    return shipments.filter((s) => {
      if (!s.created_at) return false;
      const d = new Date(s.created_at);
      return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
    });
  }, [shipments, selectedMonthKey]);

  // KPI Calculations
  const totalCount = filteredShipments.length;

  const deliveredShipments = useMemo(() => {
    return filteredShipments.filter(
      (s) => s.delivered_at || s.current_status === 'delivered' || s.current_status === 'Teslim Edildi'
    );
  }, [filteredShipments]);

  const avgDeliveryDaysFormatted = useMemo(() => {
    let totalDays = 0;
    let validCount = 0;

    deliveredShipments.forEach((s) => {
      if (s.created_at && s.delivered_at) {
        const start = new Date(s.created_at).getTime();
        const end = new Date(s.delivered_at).getTime();
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0) {
          totalDays += diffDays;
          validCount++;
        }
      }
    });

    if (validCount === 0) return '0';
    return Math.round(totalDays / validCount).toString();
  }, [deliveredShipments]);

  const successRate = useMemo(() => {
    if (totalCount === 0) return '0';
    return ((deliveredShipments.length / totalCount) * 100).toFixed(1);
  }, [totalCount, deliveredShipments]);

  // Courier Company Distribution
  const courierStats = useMemo(() => {
    if (filteredShipments.length === 0) {
      return {
        totalCompanies: 0,
        breakdown: [] as CourierBreakdownItem[],
      };
    }

    const map: Record<string, number> = {};
    filteredShipments.forEach((s) => {
      const carrier = resolveShipmentCarrier(s);
      const companyName = carrier.name;
      map[companyName] = (map[companyName] || 0) + 1;
    });

    const total = filteredShipments.length;
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);

    const breakdown: CourierBreakdownItem[] = entries.map(([label, count], index) => {
      const fraction = total > 0 ? count / total : 0;
      const pct = Math.round(fraction * 100);
      return {
        label,
        count,
        pct: `%${pct}`,
        fraction,
        color: COURIER_CHART_COLORS[index % COURIER_CHART_COLORS.length],
      };
    });

    return {
      totalCompanies: entries.length,
      breakdown,
    };
  }, [filteredShipments]);

  return {
    selectedMonthKey,
    setSelectedMonthKey,
    selectedMonthLabel,
    monthlyBarData,
    filteredShipments,
    totalCount,
    deliveredCount: deliveredShipments.length,
    avgDeliveryDaysFormatted,
    successRate,
    courierStats,
  };
};
