import React, { useState, useEffect } from 'react';
import { BarChart, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export default function FinancialTrendTab({ buildingRoom }) {
  const [viewMode, setViewMode] = useState('room'); // 'room' | 'building'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
      setLoading(true);
      setAnimate(false);
      // 如果是看整栋，则截取前缀 (例如 "A-101" -> "A")
      const target = viewMode === 'room' ? buildingRoom : buildingRoom.split('-')[0];
      const token = localStorage.getItem('butler_auth_token');
      fetch(`${API_BASE_URL}/api/stats/payments?target=${encodeURIComponent(target)}&year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(resData => {
          setData(resData.trends || []);
          setLoading(false);
          // 微秒延迟让 React 渲染完 DOM 后再触发生长 CSS 动画
          setTimeout(() => setAnimate(true), 100); 
      })
      .catch(err => {
          console.error(err);
          setLoading(false);
      });
  }, [buildingRoom, viewMode, selectedYear]);

  // 缴费时效性分析推演逻辑
  const validDays = data.filter(d => d.pay_day !== null && d.pay_day > 0).map(d => d.pay_day);
  const avgDay = validDays.length ? (validDays.reduce((sum, d) => sum + d, 0) / validDays.length).toFixed(1) : 0;
  const missingCount = data.filter(d => d.pay_day === 0).length;
  const avgLevelStr = avgDay === 0 ? '长期欠费' : avgDay <= 10 ? '上旬极速' : avgDay <= 20 ? '中旬正常' : '下旬拖延';
  
  const getBottomPercent = (day) => {
      if (day === 0 || day === null) return 0;
      return 100 - ((day - 1) / 30) * 85;
  };
  let svgPath = "";
  if (data.length > 0) {
    svgPath = data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * 1000;
        const y = 200 - (getBottomPercent(d.pay_day) / 100) * 200;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  } else {
    // Provide a default valid path if data is empty
    svgPath = "M 0 200 L 1000 200";
  }
  const areaPath = `${svgPath} L 1000 200 L 0 200 Z`;
  
  return (
      <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white animate-in fade-in duration-500">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h4 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2">
               <BarChart className="w-4 h-4 text-[#007AFF]" />
               {selectedYear}年度 物业缴费时间趋势
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-black/5 rounded-lg p-0.5">
                <button onClick={() => setSelectedYear(y => y - 1)} className="px-2 py-1 hover:bg-black/5 rounded-md transition-colors text-[#86868b] hover:text-[#1d1d1f] font-bold">&lt;</button>
                <span className="text-xs font-bold text-[#1d1d1f] min-w-[3rem] text-center">{selectedYear}</span>
                <button onClick={() => setSelectedYear(y => y + 1)} className="px-2 py-1 hover:bg-black/5 rounded-md transition-colors text-[#86868b] hover:text-[#1d1d1f] font-bold">&gt;</button>
              </div>
              <div className="flex bg-[#F2F2F7] p-1 rounded-lg">
                 <button onClick={() => setViewMode('room')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'room' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>当前住户</button>
                 <button onClick={() => setViewMode('building')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'building' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>整栋楼宇</button>
              </div>
            </div>
         </div>
         
         {loading ? (
             <div className="h-64 flex flex-col items-center justify-center text-[#86868b] text-sm"><Loader2 className="w-5 h-5 animate-spin mb-2 text-[#007AFF]"/> 计算财务分析模型...</div>
         ) : (
             <div className="relative mt-8 mb-8 mx-4 sm:mx-8 pb-8">
                <div className="relative h-64 border-b-2 border-black/10">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {[
                    { label: '极速 (1日)', bottom: '100%' },
                    { label: '中旬 (15日)', bottom: `${getBottomPercent(15)}%` },
                    { label: '下旬 (30日)', bottom: `${getBottomPercent(30)}%` },
                    { label: '预警 (断缴)', bottom: '10%' }
                  ].map(tier => (<div key={tier.label} className="border-b border-black/5 w-full absolute flex items-center" style={{ bottom: tier.bottom }}><span className="text-[10px] font-medium text-[#86868b] -translate-y-[50%] bg-white/60 pr-2">{tier.label}</span></div>))}
                </div>
                
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 overflow-visible pointer-events-none">
                   <defs>
                       <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
                           <stop offset="0%" stopColor="#3b82f6" />
                           <stop offset="100%" stopColor="#10b981" />
                       </linearGradient>
                       <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                           <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                       </linearGradient>
                   </defs>
                   <path d={areaPath} fill="url(#areaGradient2)" className="transition-all duration-1000 ease-in-out" style={{ opacity: animate ? 1 : 0 }} />
                   <path d={svgPath} fill="none" stroke="url(#lineGradient2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                         className="transition-all duration-1500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                         style={{ strokeDasharray: 3000, strokeDashoffset: animate ? 0 : 3000 }} />
                </svg>

                {/* 修复：补上缺失的遍历索引 i，恢复 X 轴坐标计算 */}
                {data.map((d, i) => {
                   const isFuture = d.pay_day === null;
                   const isUnpaid = d.pay_day === 0;
                   const bottomPercent = getBottomPercent(d.pay_day);
                   const dotColor = isFuture ? 'bg-black/10 border-black/10' : isUnpaid ? 'bg-red-500 border-red-200' : d.pay_day <= 10 ? 'bg-emerald-500 border-emerald-200' : d.pay_day <= 20 ? 'bg-blue-500 border-blue-200' : 'bg-orange-500 border-orange-200';
                   const textColor = isFuture ? 'text-[#86868b]' : isUnpaid ? 'text-red-500' : d.pay_day <= 10 ? 'text-emerald-600' : d.pay_day <= 20 ? 'text-blue-600' : 'text-orange-600';
                   const label = isFuture ? '尚未发生' : isUnpaid ? '未缴 (断缴)' : `${d.pay_day} 日`;

                   return (
                      <div key={d.month} className="absolute w-0 h-full z-10" style={{ left: `${(i / Math.max(1, data.length - 1)) * 100}%` }}>
                         <div className="absolute w-8 h-8 -translate-x-1/2 translate-y-1/2 flex items-center justify-center group cursor-pointer" style={{ bottom: `${bottomPercent}%` }}>
                            <div className="absolute opacity-0 group-hover:opacity-100 bg-white/95 backdrop-blur-md border border-black/5 text-[#1d1d1f] text-xs py-1.5 px-3 rounded-xl transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50" style={{ bottom: '100%', marginBottom: '6px' }}>
                            <div className="text-[10px] text-[#86868b] mb-0.5">{d.month}</div>
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
                         
                         <div className="absolute top-[100%] mt-3 w-12 -ml-6 text-center text-[11px] sm:text-xs font-bold text-[#86868b]">
                            {d.month.slice(5).replace(/^0/, '')}月
                         </div>
                      </div>
                   )
                })}
                </div>
             </div>
         )}
         
         {/* 数据推演结论模块 */}
         {!loading && (
             <div className="mt-10 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-sm text-[#424245] flex items-start gap-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-[#007AFF]"><BarChart className="w-4 h-4"/></div>
                <div>
                   <div className="font-bold text-[#1d1d1f] mb-1">系统简报</div>
                   <p className="leading-relaxed text-xs">
                     {viewMode === 'room' 
                       ? `该住户近一年平均在每月 ${avgDay} 日左右缴费，整体处于【${avgLevelStr}】水平。账单记录${missingCount > 2 ? '存在多次断缴异常现象，建议管家主动上门走访，了解业主实际需求。' : missingCount > 0 ? '偶尔出现断缴，建议保持关注。' : avgDay <= 10 ? '缴费极为积极，属于高粘性优质客户。' : avgDay <= 20 ? '缴费规律正常，现金流稳定。' : '缴费时间偏晚，建议适当增加催缴或关怀提醒。'}` 
                       : `该栋楼宇近一年平均缴费日期为每月 ${avgDay} 日，整体趋势集中在【${avgLevelStr}】。近期收缴积极性呈现${data[data.length-1]?.pay_day <= data[0]?.pay_day && data[data.length-1]?.pay_day > 0 ? '稳步上升' : '轻微拖延'}趋势，建议维持目前的催缴策略与园区服务标准。`
                     }
                   </p>
                </div>
             </div>
         )}
      </div>
  )
}