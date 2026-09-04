import React from 'react';
import { Users, BarChart3, Bot, AlertCircle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-white p-4 border-2 border-[#111] shadow-[4px_4px_0px_#111] flex items-center gap-3">
    <div className={`p-2 border-2 border-[#111] shadow-[2px_2px_0px_#111] ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

interface AdminStatsProps {
  stats: {
    users: number;
    analyses: number;
    errors: number;
    chats: number;
  };
  chartData: {
    labels: string[];
    datasets: any[];
  };
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats, chartData }) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Logins" value={stats.users} color="bg-mio-lime" />
        <StatCard icon={<BarChart3 className="w-5 h-5 text-white" />} label="Análisis" value={stats.analyses} color="bg-mio-violet text-white" />
        <StatCard icon={<Bot className="w-5 h-5" />} label="IA Chats" value={stats.chats} color="bg-blue-400" />
        <StatCard icon={<AlertCircle className="w-5 h-5 text-white" />} label="Errores" value={stats.errors} color="bg-red-400 text-white" />
      </div>

      <div className="bg-white p-6 border-2 border-[#111] shadow-[4px_4px_0px_#111]">
        <h3 className="font-bold text-gray-900 mb-4">Distribución de Eventos</h3>
        <ReactECharts
          theme="neo-brutalist"
          option={{
            grid: { containLabel: true, top: 10, bottom: 20, left: 10, right: 10 },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: chartData.labels },
            yAxis: { type: 'value' },
            series: chartData.datasets.map((d: any) => ({
              name: d.label,
              type: 'bar',
              data: d.data,
              itemStyle: {
                color: (params: any) => d.backgroundColor[params.dataIndex],
                borderColor: d.borderColor,
                borderWidth: d.borderWidth,
              },
            })),
          }}
          style={{ height: '220px' }}
        />
      </div>
    </div>
  );
};
