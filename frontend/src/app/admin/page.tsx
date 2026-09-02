'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, getDocs, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Activity, Users, AlertCircle, Trash2, ShieldAlert, Filter, Database, BarChart3, Bot, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactECharts from 'echarts-for-react';
import Navbar from '@/components/Navbar';
import LogDetailsRenderer from '@/components/LogDetailsRenderer';
import { neoBrutalistTheme } from '@/lib/echartsNeoBrutalistTheme';
import * as echarts from 'echarts';
echarts.registerTheme('neo-brutalist', neoBrutalistTheme);

const ADMIN_EMAILS = ['tadeomunozgarces@gmail.com', 'milenapabraham@gmail.com'];

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });

    // Fallback de seguridad por si Firebase tarda demasiado en responder o está bloqueado
    const timeout = setTimeout(() => {
      if (isMounted) {
        setAuthorized((prev) => (prev === null ? false : prev));
      }
    }, 2500);

    return () => {
      isMounted = false;
      unsubAuth();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!authorized) return;

    const q = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(300));
    const unsubLogs = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(newLogs);
    }, (error) => {
      console.error("Error fetching logs:", error);
      toast.error("Error al leer logs. Verificá las reglas de Firestore.");
    });

    return () => unsubLogs();
  }, [authorized]);

  const cleanOldLogs = async () => {
    if (!confirm('¿Seguro que querés borrar los logs de más de 30 días?')) return;
    setCleaning(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const q = query(collection(db, 'system_logs'), where('timestamp', '<', thirtyDaysAgo), limit(500));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast.success('No hay logs antiguos para borrar.');
        return;
      }
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      toast.success(`Se borraron ${snapshot.size} logs antiguos.`);
    } catch (err: any) {
      if (err.message.includes('failed-precondition')) {
        const urlMatch = err.message.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
        if (urlMatch) {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-sm">Falta crear índice Firestore</span>
              <a href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline break-all">Click acá para crearlo</a>
            </div>
          ), { duration: 10000 });
        }
      }
    } finally {
      setCleaning(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterType !== 'all' && !log.type.includes(filterType)) return false;
      if (search && !JSON.stringify(log).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, filterType, search]);

  const stats = useMemo(() => {
    let u = 0, a = 0, e = 0, c = 0;
    logs.forEach(log => {
      if (log.type.includes('auth_')) u++;
      if (log.type === 'analysis_success') a++;
      if (log.type === 'analysis_error') e++;
      if (log.type === 'chat_session_started') c++;
    });
    return { users: u, analyses: a, errors: e, chats: c };
  }, [logs]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = { 'Auth': 0, 'Análisis': 0, 'Errores': 0, 'Asistente': 0 };
    logs.forEach(log => {
      if (log.type.includes('auth_')) counts['Auth']++;
      else if (log.type === 'analysis_success') counts['Análisis']++;
      else if (log.type.includes('error')) counts['Errores']++;
      else if (log.type.includes('chat')) counts['Asistente']++;
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Eventos (Últimos 300)',
          data: Object.values(counts),
          backgroundColor: ['#bdf559', '#815ae1', '#ef4444', '#3b82f6'],
          borderColor: '#111',
          borderWidth: 2,
        }
      ]
    };
  }, [logs]);

  if (authorized === null) {
    return <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">Verificando acceso...</div>;
  }
  
  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />
      <div className="flex-1 p-6 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border-2 border-[#111] shadow-[6px_6px_0px_#111]">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="w-8 h-8 text-mio-violet" />
              MIO Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Panel de Control para Desarrolladores</p>
          </div>
          <button 
            onClick={cleanOldLogs}
            disabled={cleaning}
            className="flex items-center gap-2 bg-red-50 text-red-600 border-2 border-red-200 px-4 py-2 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {cleaning ? 'Limpiando...' : 'Purgar BD'}
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Stats & Chart */}
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<Users className="w-5 h-5"/>} label="Logins" value={stats.users} color="bg-mio-lime" />
              <StatCard icon={<BarChart3 className="w-5 h-5"/>} label="Análisis" value={stats.analyses} color="bg-mio-violet text-white" />
              <StatCard icon={<Bot className="w-5 h-5"/>} label="IA Chats" value={stats.chats} color="bg-blue-400" />
              <StatCard icon={<AlertCircle className="w-5 h-5"/>} label="Errores" value={stats.errors} color="bg-red-400 text-white" />
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
                        itemStyle: { color: d.backgroundColor }
                    }))
                }}
                style={{ height: '300px', width: '100%' }}
              />
            </div>
          </div>

          {/* Right Column: Interactive Table */}
          <div className="lg:col-span-2 bg-white border-2 border-[#111] shadow-[6px_6px_0px_#111] flex flex-col h-[650px]">
            {/* Toolbar */}
            <div className="p-4 border-b-2 border-[#111] bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')}>Todos</FilterButton>
                <FilterButton active={filterType === 'auth'} onClick={() => setFilterType('auth')}>Auth</FilterButton>
                <FilterButton active={filterType === 'analysis'} onClick={() => setFilterType('analysis')}>Análisis</FilterButton>
                <FilterButton active={filterType === 'error'} onClick={() => setFilterType('error')}>Errores</FilterButton>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar UID, error..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border-2 border-[#111] focus:outline-none focus:ring-2 focus:ring-mio-violet/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 border-b-2 border-[#111] shadow-sm">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-900 uppercase">Hora</th>
                    <th className="p-4 text-xs font-bold text-gray-900 uppercase">Evento</th>
                    <th className="p-4 text-xs font-bold text-gray-900 uppercase">Detalle / Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">No hay eventos para mostrar</td></tr>
                  ) : filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-[#111] shadow-[2px_2px_0px_#111] ${
                          log.type.includes('error') ? 'bg-red-400 text-white' : 
                          log.type.includes('auth') ? 'bg-mio-lime text-black' :
                          log.type.includes('chat') ? 'bg-blue-400 text-white' : 'bg-mio-violet text-white'
                        }`}>
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        <LogDetailsRenderer log={log} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        
        {/* Model Metrics Section */}
        <div className="mt-8 bg-white border-2 border-[#111] shadow-[6px_6px_0px_#111] flex flex-col max-h-[400px]">
          <div className="p-4 border-b-2 border-[#111] bg-mio-lime">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Métricas de Rendimiento de Modelos
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 border-b-2 border-[#111] shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-900 uppercase">Dataset</th>
                  <th className="p-4 text-xs font-bold text-gray-900 uppercase">Prophet (Predicción)</th>
                  <th className="p-4 text-xs font-bold text-gray-900 uppercase">Isolation Forest (Anomalías)</th>
                  <th className="p-4 text-xs font-bold text-gray-900 uppercase">LightGBM (Factores)</th>
                  <th className="p-4 text-xs font-bold text-gray-900 uppercase">PCA (Segmentación)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.filter(l => l.type === 'analysis_success' && l.metrics).length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay métricas de modelos aún</td></tr>
                ) : logs.filter(l => l.type === 'analysis_success' && l.metrics).map((log) => (
                  <tr key={`metric-${log.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs font-bold text-gray-700">{log.filename || 'Desconocido'}</td>
                    <td className="p-4 text-xs text-gray-600">
                      {log.metrics.forecast?.error ? <span className="text-red-500">Error: {log.metrics.forecast.error}</span> : 
                        (log.metrics.forecast?.mae ? `MAE: ${log.metrics.forecast.mae} | MAPE: ${log.metrics.forecast.mape}%` : '-')}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {log.metrics.anomalies?.error ? <span className="text-red-500">Error: {log.metrics.anomalies.error}</span> : 
                        (log.metrics.anomalies?.pct_anomalias !== undefined ? `${log.metrics.anomalies.n_anomalias} anomalías (${log.metrics.anomalies.pct_anomalias}%)` : '-')}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {log.metrics.feature_importance?.error ? <span className="text-red-500">Error: {log.metrics.feature_importance.error}</span> : 
                        (log.metrics.feature_importance?.n_features ? `${log.metrics.feature_importance.n_features} variables analizadas` : '-')}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {log.metrics.segmentation?.error ? <span className="text-red-500">Error: {log.metrics.segmentation.error}</span> : 
                        (log.metrics.segmentation?.varianza_explicada_pca ? `K=${log.metrics.segmentation.k} | Varianza PCA: ${log.metrics.segmentation.varianza_explicada_pca}%` : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white border-2 border-[#111] shadow-[4px_4px_0px_#111] p-4 flex flex-col gap-2">
      <div className={`w-10 h-10 ${color} border-2 border-[#111] flex items-center justify-center shadow-[2px_2px_0px_#111]`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{label}</p>
      </div>
    </div>
  );
}

function FilterButton({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold border-2 border-[#111] transition-all ${
        active 
        ? 'bg-gray-900 text-white shadow-none translate-y-[2px]' 
        : 'bg-white text-gray-600 shadow-[2px_2px_0px_#111] hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
