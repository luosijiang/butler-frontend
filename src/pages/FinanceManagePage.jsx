import React, { useState, useEffect } from 'react';
import { BarChart, Search, Loader2, ArrowRight, Building, User, DollarSign, Calendar, CreditCard, Activity, Trash2 } from 'lucide-react';
import { sortRoomsByNumber } from '../utils/helpers';
import request from '../utils/request';

export default function FinanceManagePage() {
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null); // { id: 'A', type: 'building' | 'room', owner: {} }

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [animate, setAnimate] = useState(false);

  // 获取左侧所有住户用于构建树形菜单
  useEffect(() => {
    request.get('/api/records/list')
      .then(data => {
        let fetchedOwners = Array.isArray(data.records) ? data.records : [];
        fetchedOwners.sort((a, b) => sortRoomsByNumber(a.building_room, b.building_room));
        setOwners(fetchedOwners);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingOwners(false));
  }, []);

  // 当选中的目标发生变化时，请求对应的财务流水图表数据
  useEffect(() => {
    if (!selectedTarget) return;
    setLoadingChart(true);
    setAnimate(false);
    // 如果是楼宇，后端期望收到 'A'；如果是房间，期望收到 'A-101'
    const targetId = selectedTarget.type === 'building' ? selectedTarget.id : selectedTarget.id;
    
    request.get(`/api/stats/payments?target=${encodeURIComponent(targetId)}&year=${selectedYear}`)
      .then(resData => {
        setChartData(resData.trends || []);
        // 延迟触发CSS高度动画，制造数据生长的科幻感
        setTimeout(() => setAnimate(true), 100);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingChart(false));
  }, [selectedTarget, selectedYear]);

  // 对侧边栏菜单数据进行提取和过滤
  const buildings = [...new Set(owners.map(o => (o.building_room || '').split('-')[0]))].filter(Boolean);
  const lowerSearch = searchTerm.toLowerCase();
  
  const filteredBuildings = buildings.filter(b => b.toLowerCase().includes(lowerSearch) || '栋楼宇'.includes(lowerSearch));
  const filteredRooms = owners.filter(o => 
    (o.building_room && o.building_room.toLowerCase().includes(lowerSearch)) || 
    (o.owner_name && o.owner_name.toLowerCase().includes(lowerSearch))
  );

  // 一键清理假数据操作
  const handleClearFakeData = async () => {
      if (!window.confirm("确定要清空数据库中所有的历史财务记录吗？\n\n(这可以帮你一键清理掉之前自动生成的假数据)")) return;
      await request.delete('/api/stats/payments/clear');
      setChartData([]);
  };

  // 缴费时效性分析推演逻辑
  const validDays = chartData.filter(d => d.pay_day !== null && d.pay_day > 0).map(d => d.pay_day);
  const avgDay = validDays.length ? (validDays.reduce((sum, d) => sum + d, 0) / validDays.length).toFixed(1) : 0;
  const missingCount = chartData.filter(d => d.pay_day === 0).length;
  const avgLevelStr = avgDay === 0 ? '长期欠费' : avgDay <= 10 ? '上旬极速' : avgDay <= 20 ? '中旬正常' : '下旬拖延';

  // SVG 折线图路径与坐标映射计算
  const getBottomPercent = (day) => {
      if (day === 0 || day === null) return 0;
      return 100 - ((day - 1) / 30) * 85; // 1-31日 映射到 100%-15% 的高度区间
  };
  const svgPath = chartData.map((d, i) => {
      const x = (i / Math.max(1, chartData.length - 1)) * 1000;
      const y = 200 - (getBottomPercent(d.pay_day) / 100) * 200;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  const areaPath = `${svgPath} L 1000 200 L 0 200 Z`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden flex flex-col md:flex-row flex-1 min-h-[80vh] md:min-h-[600px] transition-all duration-500">
        
        {/* 左侧：层级/搜索列表 */}
        <div className={`w-full md:w-1/3 border-b md:border-b-0 border-white/30 flex flex-col bg-white/10 shrink-0 transition-all relative z-0 ${selectedTarget ? 'hidden md:flex' : 'flex-1 md:h-auto'}`}>
          <div className="p-5 border-b border-white/20 bg-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-3"><div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><DollarSign className="w-4 h-4" /></div> 财务状况管理</h2>
              <button onClick={handleClearFakeData} title="一键清空假数据" className="p-2 hover:bg-red-100 text-red-500 bg-red-50 rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="relative"><Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" /><input type="text" placeholder="搜索楼宇 / 房号 / 姓名..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50" /></div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {loadingOwners ? (<div className="text-center text-xs text-[#86868b] py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>加载数据...</div>) : (
              <>
                {filteredBuildings.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-[#86868b] px-3 mb-2 uppercase tracking-wider">楼宇整体分析</div>
                    {filteredBuildings.map(b => (
                      <button key={b} onClick={() => setSelectedTarget({ id: b, type: 'building' })} className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-500 flex items-center gap-3 group ${selectedTarget?.id === b ? 'bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 text-emerald-600 scale-[1.02] translate-x-1' : 'hover:bg-white/40 text-[#424245] border border-transparent'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selectedTarget?.id === b ? 'bg-emerald-100 text-emerald-600' : 'bg-black/5 text-[#86868b]'}`}><Building className="w-4 h-4"/></div>
                        <div className="flex-1 min-w-0"><div className={`font-semibold text-sm truncate ${selectedTarget?.id === b ? 'text-[#1d1d1f]' : ''}`}>{b} 栋</div><div className="text-[11px] mt-0.5 opacity-60">整栋收缴趋势分析</div></div>
                        <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedTarget?.id === b ? 'opacity-100 text-emerald-600' : 'text-[#86868b]'}`} />
                      </button>
                    ))}
                  </div>
                )}
                {filteredRooms.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-[#86868b] px-3 mb-2 uppercase tracking-wider">独立住户分析</div>
                    {filteredRooms.map(owner => (
                      <button key={owner.building_room} onClick={() => setSelectedTarget({ id: owner.building_room, type: 'room', owner })} className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-500 flex items-center gap-3 group ${selectedTarget?.id === owner.building_room ? 'bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 text-emerald-600 scale-[1.02] translate-x-1' : 'hover:bg-white/40 text-[#424245] border border-transparent'}`}>
                         <div className="flex-1 min-w-0"><div className={`font-semibold text-sm truncate ${selectedTarget?.id === owner.building_room ? 'text-[#1d1d1f]' : ''}`}>{owner.building_room}</div><div className="text-[11px] mt-0.5 opacity-60 truncate">{owner.owner_name || '未知业主'}</div></div>
                         <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedTarget?.id === owner.building_room ? 'opacity-100 text-emerald-600' : 'text-[#86868b]'}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 右侧：趋势图与卡片 */}
        <div className={`w-full md:w-2/3 flex flex-col bg-gradient-to-br from-white/95 to-white/70 shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.15),-24px_0_48px_-16px_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,1)] relative z-10 flex-1 min-w-0 min-h-0 ${!selectedTarget ? 'hidden md:flex' : 'flex'}`}>
          {selectedTarget ? (
            <>
              <div className="p-5 border-b border-white/80 bg-white/60 backdrop-blur-md flex items-center gap-2 shrink-0">
                <button onClick={() => setSelectedTarget(null)} className="md:hidden p-1.5 -ml-2 hover:bg-black/5 rounded-lg text-[#86868b] active:scale-95 transition-all"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                <h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                  {selectedTarget.type === 'building' ? `${selectedTarget.id}栋 宏观财务趋势` : `${selectedTarget.id} 住户财务详情`}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
                
                {/* 如果是选择单独住户，显示详细缴费人信息卡片 */}
                {selectedTarget.type === 'room' && selectedTarget.owner && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><User className="w-5 h-5"/></div><div className="min-w-0"><div className="text-[11px] text-[#86868b] mb-0.5 font-medium tracking-wider">缴费人</div><div className="font-semibold text-[#1d1d1f] text-sm truncate">{selectedTarget.owner.payer || selectedTarget.owner.owner_name || '未登记'}</div></div></div>
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><CreditCard className="w-5 h-5"/></div><div className="min-w-0"><div className="text-[11px] text-[#86868b] mb-0.5 font-medium tracking-wider">缴费方式</div><div className="font-semibold text-[#1d1d1f] text-sm truncate">{selectedTarget.owner.payment_method || '未登记'}</div></div></div>
                    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0"><Calendar className="w-5 h-5"/></div><div className="min-w-0"><div className="text-[11px] text-[#86868b] mb-0.5 font-medium tracking-wider">缴费周期</div><div className="font-semibold text-[#1d1d1f] text-sm truncate">{selectedTarget.owner.payment_cycle || '未登记'}</div></div></div>
                  </div>
                )}

                {loadingChart ? (<div className="h-64 flex flex-col items-center justify-center text-[#86868b] text-sm"><Loader2 className="w-5 h-5 animate-spin mb-2 text-emerald-500"/> 构建数据模型...</div>) : (
                  <div className="bg-white/40 backdrop-blur-3xl border border-white/80 p-5 sm:p-7 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <h4 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2"><BarChart className="w-4 h-4 text-emerald-500" />{selectedYear}年度 物业缴费时间趋势</h4>
                      <div className="flex items-center bg-white/60 border border-black/5 rounded-xl p-1 shadow-sm shrink-0">
                        <button onClick={() => setSelectedYear(y => y - 1)} className="px-2.5 py-1.5 hover:bg-black/5 rounded-lg transition-colors text-[#86868b] hover:text-[#1d1d1f] font-bold">&lt;</button>
                        <span className="text-[13px] font-bold text-[#1d1d1f] min-w-[3.5rem] text-center">{selectedYear}</span>
                        <button onClick={() => setSelectedYear(y => y + 1)} className="px-2.5 py-1.5 hover:bg-black/5 rounded-lg transition-colors text-[#86868b] hover:text-[#1d1d1f] font-bold">&gt;</button>
                      </div>
                    </div>
                    
                    {/* 图表主容器，增加底部 padding 留出专属文字空间 */}
                    <div className="relative mt-8 mb-8 mx-4 sm:mx-8 pb-8">
                       {/* 主高度区 */}
                       <div className="relative h-64 border-b-2 border-black/10">
                         {/* 1. 背景阶梯刻度 */}
                       <div className="absolute inset-0 z-0 pointer-events-none">
                         {[
                           { label: '极速 (1日)', bottom: '100%' },
                           { label: '中旬 (15日)', bottom: `${getBottomPercent(15)}%` },
                           { label: '下旬 (30日)', bottom: `${getBottomPercent(30)}%` },
                           { label: '预警 (断缴)', bottom: '10%' }
                         ].map(tier => (<div key={tier.label} className="border-b border-black/5 w-full absolute flex items-center" style={{ bottom: tier.bottom }}><span className="text-[10px] font-medium text-[#86868b] -translate-y-[50%] bg-white/60 pr-2">{tier.label}</span></div>))}
                       </div>
                       
                       {/* 2. SVG 走势折线 */}
                       <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 overflow-visible pointer-events-none">
                          <defs>
                              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#3b82f6" />
                                  <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                              </linearGradient>
                          </defs>
                          <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-1000 ease-in-out" style={{ opacity: animate ? 1 : 0 }} />
                          <path d={svgPath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                                className="transition-all duration-1500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                style={{ strokeDasharray: 3000, strokeDashoffset: animate ? 0 : 3000 }} />
                       </svg>

                       {/* 修复：补上缺失的遍历索引 i，恢复 X 轴坐标计算 */}
                       {chartData.map((d, i) => {
                          const isFuture = d.pay_day === null;
                          const isUnpaid = d.pay_day === 0;
                          const bottomPercent = getBottomPercent(d.pay_day);
                          const dotColor = isFuture ? 'bg-black/10 border-black/10' : isUnpaid ? 'bg-red-500 border-red-200' : d.pay_day <= 10 ? 'bg-emerald-500 border-emerald-200' : d.pay_day <= 20 ? 'bg-blue-500 border-blue-200' : 'bg-orange-500 border-orange-200';
                          const textColor = isFuture ? 'text-[#86868b]' : isUnpaid ? 'text-red-500' : d.pay_day <= 10 ? 'text-emerald-600' : d.pay_day <= 20 ? 'text-blue-600' : 'text-orange-600';
                          const label = isFuture ? '尚未发生' : isUnpaid ? '未缴 (断缴)' : `${d.pay_day} 日`;

                          return (
                             <div key={d.month} className="absolute w-0 h-full z-10" style={{ left: `${(i / Math.max(1, chartData.length - 1)) * 100}%` }}>
                                <div className="absolute w-8 h-8 -translate-x-1/2 translate-y-1/2 flex items-center justify-center group cursor-pointer" style={{ bottom: `${bottomPercent}%` }}>
                                   <div className="absolute opacity-0 group-hover:opacity-100 bg-white/95 backdrop-blur-md border border-black/5 text-[#1d1d1f] text-xs py-1.5 px-3 rounded-xl transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50" style={{ bottom: '100%', marginBottom: '6px' }}>
                                      <div className="text-[10px] text-[#86868b] mb-0.5 text-center">{d.month}</div>
                                      <div className={`font-bold text-center ${textColor}`}>{label}</div>
                                   </div>
                                   <div 
                                      className={`w-3.5 h-3.5 rounded-full border-[2.5px] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.6] group-hover:shadow-md ${dotColor}`}
                                      style={{ 
                                          opacity: animate ? (isFuture ? 0.3 : 1) : 0,
                                          transform: animate ? 'scale(1)' : 'scale(0)',
                                          transitionDelay: `${i * 40}ms`
                                      }}
                                   />
                                </div>
                                
                                {/* 🎯 月份标签：强制挂载在 100% 底部之下，完全对齐数据点 */}
                                <div className="absolute top-[100%] mt-3 w-12 -ml-6 text-center text-[11px] sm:text-xs font-bold text-[#86868b]">
                                   {d.month.slice(5).replace(/^0/, '')}月
                                </div>
                             </div>
                          )
                       })}
                       </div>
                    </div>
                    
                    <div className="mt-12 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-sm text-[#424245] flex items-start gap-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]"><div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600"><Activity className="w-4 h-4"/></div><div><div className="font-bold text-[#1d1d1f] mb-1">系统简报</div><p className="leading-relaxed text-xs">{selectedTarget.type === 'room' ? `该住户近一年平均在每月 ${avgDay} 日左右缴费，整体处于【${avgLevelStr}】水平。账单记录${missingCount > 2 ? '存在多次断缴异常现象，建议管家主动上门走访，了解业主实际需求。' : missingCount > 0 ? '偶尔出现断缴，建议保持关注。' : avgDay <= 10 ? '缴费极为积极，属于高粘性优质客户。' : avgDay <= 20 ? '缴费规律正常，现金流稳定。' : '缴费时间偏晚，建议适当增加催缴或关怀提醒。'}` : `该栋楼宇近一年平均缴费日期为每月 ${avgDay} 日，整体趋势集中在【${avgLevelStr}】。近期收缴积极性呈现${chartData[chartData.length-1]?.pay_day <= chartData[0]?.pay_day && chartData[chartData.length-1]?.pay_day > 0 ? '稳步上升' : '轻微拖延'}趋势，建议维持目前的催缴策略与园区服务标准。`}</p></div></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] p-6"><div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/80"><DollarSign className="w-8 h-8 text-emerald-500/60" /></div><p className="font-medium text-[#424245] text-base">请在左侧选择要查看的楼宇或住户</p><p className="text-sm mt-2">获取直观的财务分析模型与收缴预警</p></div>
          )}
        </div>
      </div>
    </div>
  );
}