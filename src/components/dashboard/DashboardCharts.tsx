'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import type {
  ChannelMetric,
  DailySalesPoint,
  SellerMetric,
  StockAgingBuckets,
} from '@/lib/dashboard/metrics';
import { KpiGrid, type KpiItem } from '@/components/dastone/KpiGrid';
import { EmptyState } from '@/components/dastone/EmptyState';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CHART_COLORS = ['#6f6af8', '#22b783', '#16cdc7', '#f9b931', '#ef4d56', '#a8b5d1'];

interface DashboardChartsProps {
  dailySales: DailySalesPoint[];
  channelMetrics: ChannelMetric[];
  stockAging: StockAgingBuckets;
  sellerMetrics: SellerMetric[];
  funnel: {
    leads: number;
    open: number;
    won: number;
    lost: number;
  };
}

function formatCurrencyShort(value: number) {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
}

function buildFunnelProgress(value: number, base: number) {
  if (base <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / base) * 100)));
}

export function DashboardCharts({
  dailySales,
  channelMetrics,
  stockAging,
  sellerMetrics,
  funnel,
}: DashboardChartsProps) {
  const salesChart = useMemo(() => {
    const options: ApexOptions = {
      chart: {
        type: 'line',
        toolbar: { show: false },
        fontFamily: 'Roboto, sans-serif',
        zoom: { enabled: false },
      },
      colors: ['#6f6af8'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      markers: {
        size: 0,
        hover: { size: 5 },
      },
      xaxis: {
        categories: dailySales.map((item) => item.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          rotate: 0,
          hideOverlappingLabels: true,
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => formatCurrencyShort(Number(value)),
        },
      },
      grid: {
        strokeDashArray: 4,
        borderColor: '#eaeff5',
      },
      tooltip: {
        y: {
          formatter: (value) =>
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              Number(value),
            ),
        },
      },
    };

    return {
      options,
      series: [{ name: 'Faturamento', data: dailySales.map((item) => item.revenue) }],
    };
  }, [dailySales]);

  const channelChart = useMemo(() => {
    const options: ApexOptions = {
      chart: { type: 'donut', fontFamily: 'Roboto, sans-serif' },
      colors: CHART_COLORS,
      labels: channelMetrics.map((item) => item.channelName),
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Vendas',
                formatter: () => String(channelMetrics.reduce((sum, item) => sum + item.salesCount, 0)),
              },
            },
          },
        },
      },
    };

    return {
      options,
      series: channelMetrics.map((item) => item.salesCount),
    };
  }, [channelMetrics]);

  const stockChart = useMemo(() => {
    const options: ApexOptions = {
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Roboto, sans-serif' },
      colors: ['#22b783', '#f9b931', '#ef4d56', '#ef4d56'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '42%',
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: ['Até 30d', '31-60d', '61-90d', '+90d'],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        strokeDashArray: 4,
        borderColor: '#eaeff5',
      },
    };

    return {
      options,
      series: [
        {
          name: 'Veículos',
          data: [stockAging.upTo30, stockAging.from31To60, stockAging.from61To90, stockAging.above90],
        },
      ],
    };
  }, [stockAging]);

  const sellerChart = useMemo(() => {
    const topSellers = sellerMetrics.slice(0, 5);
    const options: ApexOptions = {
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Roboto, sans-serif' },
      colors: ['#6f6af8'],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: '58%',
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: topSellers.map((item) => item.sellerName),
        labels: {
          formatter: (value) => formatCurrencyShort(Number(value)),
        },
      },
      grid: {
        strokeDashArray: 4,
        borderColor: '#eaeff5',
      },
      tooltip: {
        y: {
          formatter: (value) =>
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              Number(value),
            ),
        },
      },
    };

    return {
      options,
      series: [{ name: 'Lucro', data: topSellers.map((item) => item.margin) }],
    };
  }, [sellerMetrics]);

  const hasSales = dailySales.some((item) => item.revenue > 0);
  const hasFunnel = funnel.leads + funnel.open + funnel.won + funnel.lost > 0;
  const hasStock =
    stockAging.upTo30 + stockAging.from31To60 + stockAging.from61To90 + stockAging.above90 > 0;
  const funnelBase = Math.max(funnel.leads, 1);

  const funnelItems: KpiItem[] = [
    {
      id: 'funnel-leads',
      label: 'Leads no mês',
      value: funnel.leads,
      variant: 'stat',
      progress: funnel.leads > 0 ? 100 : 0,
      empty: !hasFunnel,
      emptyTitle: 'Sem leads.',
      emptyIcon: 'iconoir-page',
    },
    {
      id: 'funnel-open',
      label: 'Fichas abertas',
      value: funnel.open,
      variant: 'stat',
      progress: buildFunnelProgress(funnel.open, funnelBase),
      empty: !hasFunnel,
      emptyTitle: 'Sem fichas.',
      emptyIcon: 'iconoir-page',
    },
    {
      id: 'funnel-won',
      label: 'Fichas ganhas',
      value: funnel.won,
      variant: 'stat',
      progress: buildFunnelProgress(funnel.won, funnelBase),
      badgeClass: 'text-success',
      empty: !hasFunnel,
      emptyTitle: 'Sem ganhos.',
      emptyIcon: 'iconoir-check-circle',
    },
    {
      id: 'funnel-lost',
      label: 'Fichas perdidas',
      value: funnel.lost,
      variant: 'stat',
      progress: buildFunnelProgress(funnel.lost, funnelBase),
      badgeClass: 'text-danger',
      empty: !hasFunnel,
      emptyTitle: 'Sem perdas.',
      emptyIcon: 'iconoir-warning-circle',
    },
  ];

  return (
    <>
      <div className="row animate-stagger mb-3">
        <div className="col-lg-8 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title mb-0">Faturamento no mês</h4>
                </div>
                <div className="col-auto">
                  <span className="btn btn-sm btn-outline-light pe-none">Este mês</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              {hasSales ? (
                <div className="apex-charts">
                  <Chart options={salesChart.options} series={salesChart.series} type="line" height={320} />
                </div>
              ) : (
                <EmptyState title="Nenhuma venda no mês." icon="iconoir-cart" compact />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3 d-flex">
          <KpiGrid items={funnelItems} columns={2} />
        </div>
      </div>

      <div className="row animate-stagger mb-3">
        <div className="col-lg-4 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Vendas por canal</h4>
            </div>
            <div className="card-body">
              {channelMetrics.length ? (
                <div className="apex-charts">
                  <Chart options={channelChart.options} series={channelChart.series} type="donut" height={280} />
                </div>
              ) : (
                <EmptyState title="Nenhuma venda por canal." icon="iconoir-megaphone" compact />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Idade do estoque</h4>
            </div>
            <div className="card-body">
              {hasStock ? (
                <div className="apex-charts">
                  <Chart options={stockChart.options} series={stockChart.series} type="bar" height={280} />
                </div>
              ) : (
                <EmptyState title="Nenhum veículo em estoque." icon="iconoir-car" compact />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h4 className="card-title mb-0">Lucro por vendedor</h4>
            </div>
            <div className="card-body">
              {sellerMetrics.length ? (
                <div className="apex-charts">
                  <Chart options={sellerChart.options} series={sellerChart.series} type="bar" height={280} />
                </div>
              ) : (
                <EmptyState title="Nenhum lucro por vendedor." icon="iconoir-group" compact />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
