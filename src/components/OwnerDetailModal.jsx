import React, { useState, useEffect } from 'react';
import { FileText, X, User, Activity, Sparkles, Loader2, ArrowRight, Car, DollarSign } from 'lucide-react';
import { formatVal, fieldLabels, calculateDuration } from '../utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export default function OwnerDetailModal({ record, onClose, onAIAnalyze, showHistory, hideAIButton }) {
  const [details, setDetails] = useState(record);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedHistId, setExpandedHistId] = useState(null);
  const [expandedField, setExpandedField] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('butler_auth_token');
    fetch(`${API_BASE_URL}/api/records/${encodeURIComponent(record.building_room)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if(data && data.building_room) setDetails(data); })
    .catch(err => console.error(err))
    .finally(() => setLoadingExtra(false));
  }, [record.building_room]);

  return (
    <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
      <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40 shrink-0">
          <h3 className="font-semibold text-lg text-[#1d1d1f] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#007AFF]" /> 业主档案详情
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
        </div>
        
        {showHistory && (
          <div className="flex border-b border-black/5 bg-white/40 px-6 pt-3 gap-6 shrink-0">
            <button onClick={() => setActiveTab('details')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'}`}>基础档案</button>
            <button onClick={() => setActiveTab('history')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'}`}>操作日志</button>
          </div>
        )}

        {activeTab === 'details' ? (
          <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white space-y-6">
            <div className="space-y-5">
              {[
                { title: "基础信息", icon: User, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200/50", keys: ['building_room', 'owner_name', 'phone', 'occupation', 'age', 'gender', 'political_status', 'wechat'] },
                { title: "对接与财务", icon: DollarSign, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200/50", keys: ['contact_person', 'relationship', 'contact_phone', 'payer', 'payment_method', 'payment_cycle', 'payment_date'] },
                { title: "房产与生活", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200/50", keys: ['area', 'delivery_standard', 'is_resident', 'pets'] },
                { title: "车辆出行", icon: Car, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200/50", keys: ['car_plate', 'is_new_energy', 'use_charging_pile', 'ebike_count', 'tricycle_count', 'stroller_count'] },
                { title: "社区互动", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200/50", keys: ['activity_frequency', 'activity_type'] },
                { title: "画像特征", icon: Sparkles, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200/50", keys: ['customer_level', 'opinion_tags', 'negative_info'] }
              ].map(group => (
                <div key={group.title} className="bg-black/[0.02] p-4 sm:p-5 rounded-[1.5rem] border border-black/5">
                   <div className="flex items-center gap-2.5 mb-4"><div className={`w-7 h-7 rounded-lg ${group.bg} flex items-center justify-center border ${group.border}`}><group.icon className={`w-4 h-4 ${group.color}`} /></div><h5 className="text-[13px] font-bold text-[#424245] uppercase tracking-wider">{group.title}</h5></div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                     {group.keys.map(key => {
                        const val = details[key];
                        const displayVal = key === 'building_room' ? val : formatVal(val, key);
                        const isEmpty = displayVal === '无' || displayVal === '0' || displayVal === '';
                        const isNegative = key === 'negative_info';
                        const isCustomerLevel = key === 'customer_level';
                        const isExpanded = expandedField === key;
                        
                        let colSpanClass = 'col-span-1';
                        if (isNegative) colSpanClass = 'col-span-2 sm:col-span-3 lg:col-span-4';
                        else if (key === 'opinion_tags') colSpanClass = 'col-span-2 sm:col-span-2 lg:col-span-3';
                        
                        return (
                            <div key={key} className={`relative ${colSpanClass}`}>
                                <div onClick={() => setExpandedField(isExpanded ? null : key)} className={`flex flex-col bg-white px-3.5 py-3 rounded-[1rem] border transition-all duration-300 cursor-pointer w-full h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 z-10 ${isNegative && val ? 'border-red-200 bg-red-50' : 'border-black/[0.03]'}`} title="点击展开完整信息">
                                    <span className={`text-[11px] font-bold mb-1.5 tracking-wide ${isNegative && val ? 'text-red-500' : 'text-[#86868b]'}`}>{key === 'building_room' ? '房号' : fieldLabels[key]}</span>
                                    {isCustomerLevel ? ( <span className={`w-fit px-2.5 py-0.5 rounded-md text-[12px] font-bold shadow-sm ${val === 'S' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200/50' : val === 'A' ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200/50' : val === 'B' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/50' : 'bg-[#F2F2F7] text-[#424245] border border-black/5'}`}>{displayVal}</span>
                                    ) : ( <span className={`text-[13px] ${isNegative && val ? 'text-red-700 font-bold' : isEmpty ? 'text-[#86868b]/40 font-medium' : 'text-[#1d1d1f] font-semibold'} ${(isNegative || key === 'opinion_tags') ? 'line-clamp-2 leading-relaxed' : 'truncate'} block`}>{displayVal}</span> )}
                                </div>
                                <div onClick={() => setExpandedField(null)} className={`absolute top-0 left-0 w-[calc(100%+16px)] -translate-x-[8px] -translate-y-[8px] flex flex-col bg-white/95 backdrop-blur-3xl px-4 py-3.5 rounded-[1.2rem] border border-[#007AFF]/40 shadow-[0_32px_80px_rgba(0,122,255,0.25)] ring-4 ring-[#007AFF]/15 h-auto min-h-full z-[100] cursor-pointer transition-all duration-300 origin-top-left ${isExpanded ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-95 pointer-events-none invisible'}`} title="点击折叠">
                                   <span className={`text-[11px] font-bold mb-1.5 tracking-wide ${isNegative && val ? 'text-red-500' : 'text-[#007AFF]'}`}>{key === 'building_room' ? '房号' : fieldLabels[key]}</span>
                                   {isCustomerLevel ? (<span className={`w-fit px-2.5 py-0.5 rounded-md text-[12px] font-bold shadow-sm ${val === 'S' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200/50' : val === 'A' ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200/50' : val === 'B' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/50' : 'bg-[#F2F2F7] text-[#424245] border border-black/5'}`}>{displayVal}</span>
                                   ) : (<span className={`text-[14px] leading-relaxed break-words whitespace-pre-wrap ${isNegative && val ? 'text-red-700 font-bold' : isEmpty ? 'text-[#86868b]/40 font-medium' : 'text-[#1d1d1f] font-semibold'} block`}>{displayVal}</span>)}
                                </div>
                            </div>
                        )
                     })}
                   </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#1d1d1f] mb-3 uppercase tracking-wider border-b border-black/5 pb-2 flex items-center gap-2">历史报修记录</h4>
              {loadingExtra ? (
                 <div className="text-center text-[#86868b] text-sm py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/> 加载关联记录...</div>
              ) : details.repair_history && details.repair_history.length > 0 ? (
                 <div className="space-y-3">
                    {details.repair_history.map(rh => (
                       <div key={rh.id} className="bg-[#F9F9F9] p-4 rounded-xl text-sm border border-black/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-[#1d1d1f]">{rh.item}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${rh.status === '已完成' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{rh.status}</span>
                          </div>
                          <div className="text-[#86868b] text-xs mb-2 flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span>报事: {rh.report_time.replace('T', ' ')}</span> 
                            {rh.completion_time && (
                              <span className="text-green-600 flex items-center gap-1.5">
                                完成: {rh.completion_time.replace('T', ' ')}
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium">历时 {calculateDuration(rh.report_time, rh.completion_time)}</span>
                              </span>
                            )} 
                            <span className="text-black/10">|</span><span>录入: {rh.operator || '-'}</span>
                            <span className="text-black/10">|</span><span>接单: {rh.handler || '-'}</span>
                          </div>
                          {rh.process_detail && <div className="text-[#424245] text-xs bg-white p-2 rounded border border-black/5 mt-2"><span className="font-medium">详情:</span> {rh.process_detail}</div>}
                          {rh.completion_record && <div className="text-[#424245] text-xs bg-white p-2 rounded border border-black/5 mt-1"><span className="font-medium">完成记录:</span> {rh.completion_record}</div>}
                          {rh.callback_result && <div className="text-[#424245] text-xs bg-white p-2 rounded border border-black/5 mt-1"><span className="font-medium">回访:</span> {rh.callback_result}</div>}
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center text-sm text-[#86868b] bg-[#F9F9F9] py-6 rounded-xl border border-black/5 border-dashed">暂无关联报修记录</div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white">
            {loadingExtra ? (
               <div className="text-center text-[#86868b] text-sm py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/> 加载日志中...</div>
            ) : details.profile_history && details.profile_history.length > 0 ? (
               <div className="relative border-l border-[#007AFF]/20 ml-3 space-y-6 my-2">
                 {details.profile_history.map((hist, idx) => {
                   let snapshot = {};
                   let prevSnapshot = {};
                   try { snapshot = JSON.parse(hist.data_snapshot); } catch(e){}
                   try { if (details.profile_history[idx + 1]) prevSnapshot = JSON.parse(details.profile_history[idx + 1].data_snapshot); } catch(e){}

                   const changes = [];
                   Object.keys(fieldLabels).forEach(key => {
                     const oldVal = formatVal(prevSnapshot[key], key);
                     const newVal = formatVal(snapshot[key], key);
                     if (oldVal !== newVal) changes.push({ key, label: fieldLabels[key], oldVal, newVal });
                   });
                   
                   const isExpanded = expandedHistId === (hist.id || idx);

                   return (
                     <div key={hist.id || idx} className="relative pl-6 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-[#007AFF] rounded-full shadow-sm"></div>
                       <div className="text-xs text-[#86868b] font-mono mb-2">{hist.created_at}</div>
                       <div 
                         onClick={() => setExpandedHistId(isExpanded ? null : (hist.id || idx))}
                         className={`bg-[#F2F2F7]/50 border p-4 rounded-2xl text-sm transition-all duration-300 cursor-pointer select-none ${isExpanded ? 'border-[#007AFF]/30 shadow-[0_12px_32px_rgba(0,122,255,0.15)] bg-white -translate-y-1 scale-[1.01] z-10 relative' : 'border-black/5 shadow-sm hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5'}`}
                       >
                         <div className="flex items-center justify-between mb-3 border-b border-black/5 pb-2">
                           <div className="text-[#424245] font-medium flex items-center gap-2"><User className="w-4 h-4 text-[#007AFF]" />操作人：{snapshot.updated_by || localStorage.getItem('butler_username') || '未知'}</div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${snapshot.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' : snapshot.customer_level === 'A' ? 'bg-red-100 text-red-800' : snapshot.customer_level === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-[#E9E9EB] text-[#1d1d1f]'}`}>{snapshot.customer_level || 'C'}</span>
                         </div>
                         <div className="text-[#424245] mb-2"><span className="text-[#86868b] text-xs block mb-0.5">舆论标签</span> {snapshot.opinion_tags || '-'}</div>
                         {snapshot.negative_info && <div className="text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100/50 mb-2"><span className="text-red-500 text-xs block mb-0.5 font-medium">负向/敏感信息</span> {snapshot.negative_info}</div>}

                         <div className="mt-1 flex justify-center text-[#86868b]/40 hover:text-[#007AFF] transition-colors">
                            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#007AFF]' : ''}`}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                         </div>

                         {isExpanded && (
                            <div className="mt-2 pt-3 border-t border-black/5 animate-in slide-in-from-top-2 duration-300">
                               <h5 className="text-[11px] font-bold text-[#424245] mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> 字段修改记录</h5>
                               {changes.length > 0 ? (
                                 <div className="space-y-1.5">
                                   {changes.map(c => (
                                     <div key={c.key} className="flex items-center text-xs bg-black/[0.03] px-3 py-2 rounded-lg"><span className="w-16 text-[#86868b] font-medium shrink-0">{c.label}</span><span className="text-red-500/70 line-through truncate flex-1 min-w-0 text-right" title={c.oldVal}>{c.oldVal}</span><ArrowRight className="w-3 h-3 text-[#86868b]/40 mx-2 shrink-0" /><span className="text-green-600 font-medium truncate flex-1 min-w-0" title={c.newVal}>{c.newVal}</span></div>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="text-[11px] text-[#86868b] bg-black/[0.02] p-2 rounded-lg text-center">本次更新无实质性字段变动。</div>
                               )}
                            </div>
                          )}
                       </div>
                     </div>
                   )
                 })}
               </div>
            ) : (<div className="text-center text-sm text-[#86868b] bg-[#F9F9F9] py-6 rounded-xl border border-black/5 border-dashed">暂无历史操作日志</div>)}
          </div>
        )}

        <div className={`p-5 bg-white/40 flex ${hideAIButton ? 'justify-end' : 'justify-between'} border-t border-white/50 shrink-0`}>
          {!hideAIButton && (
            <button onClick={() => onAIAnalyze(details.building_room)} className="px-5 py-2.5 bg-gradient-to-r from-[#007AFF] to-[#0051e3] text-white rounded-xl font-medium hover:opacity-90 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95">
              <Sparkles className="w-4 h-4"/> 🧠 讓 AI 分析並草擬回覆
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-black/10 text-[#1d1d1f] rounded-xl font-medium hover:bg-black/5 transition-colors">關閉</button>
        </div>
      </div>
    </div>
  );
}