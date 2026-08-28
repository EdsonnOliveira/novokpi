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
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'Roboto, sans-serif',
        zoom: { enabled: false },
      },
      colors: ['#6f6af8'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.4,
          opacityFrom: 0.45,
          opacityTo: 0.05,
        },
      },
      xaxis: {
        categories: dailySales.map((item) => item.label),
        labels: {
          rotate: -45,
          hideOverlappingLabels: true,
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => formatCurrencyShort(Number(value)),
        },
      },
      grid: { strokeDashArray: 4 },
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
      legend: { position: 'bottom' },
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
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
          columnWidth: '48%',
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: ['Até 30d', '31-60d', '61-90d', '+90d'],
      },
      grid: { strokeDashArray: 4 },
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
      grid: { strokeDashArray: 4 },
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

  const funnelChart = useMemo(() => {
    const options: ApexOptions = {
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Roboto, sans-serif' },
      colors: ['#16cdc7'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '42%',
        },
      },
      dataLabels: { enabled: true },
      xaxis: {
        categories: ['Leads', 'Abertas', 'Ganhas', 'Perdidas'],
      },
      grid: { strokeDashArray: 4 },
    };

    return {
      options,
      series: [
        {
          name: 'Quantidade',
          data: [funnel.leads, funnel.open, funnel.won, funnel.lost],
        },
      ],
    };
  }, [funnel]);

  return (
    <>
      <div className="row animate-stagger mb-3">
        <div className="col-xl-8 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Faturamento no mês</h5>
              <Chart options={salesChart.options} series={salesChart.series} type="area" height={300} />
            </div>
          </div>
        </div>
        <div className="col-xl-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Funil CRM</h5>
              <Chart options={funnelChart.options} series={funnelChart.series} type="bar" height={300} />
            </div>
          </div>
        </div>
      </div>

      <div className="row animate-stagger mb-3">
        <div className="col-xl-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Vendas por canal</h5>
              {channelMetrics.length ? (
                <Chart options={channelChart.options} series={channelChart.series} type="donut" height={280} />
              ) : (
                <p className="text-muted mb-0">Nenhuma venda no mês.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-xl-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Idade do estoque</h5>
              <Chart options={stockChart.options} series={stockChart.series} type="bar" height={280} />
            </div>
          </div>
        </div>
        <div className="col-xl-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Lucro por vendedor</h5>
              {sellerMetrics.length ? (
                <Chart options={sellerChart.options} series={sellerChart.series} type="bar" height={280} />
              ) : (
                <p className="text-muted mb-0">Nenhuma venda no mês.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
