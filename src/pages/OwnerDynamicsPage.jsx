import React, { useState, useEffect } from 'react';
import { Activity, Search, Loader2, ArrowRight, User, FileText, Sparkles, Car, DollarSign } from 'lucide-react';
import { sortRoomsByNumber, formatVal, fieldLabels } from '../utils/helpers';
import request from '../utils/request';

export default function OwnerDynamicsPage() {
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomHistory, setRoomHistory] = useState([]);
  const [selectedOwnerDetails, setSelectedOwnerDetails] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedHistId, setExpandedHistId] = useState(null);
  const [expandedField, setExpandedField] = useState(null);

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

  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingHistory(true);
    setExpandedHistId(null);
    setSelectedOwnerDetails(null);
    setExpandedField(null);
    request.get(`/api/records/${encodeURIComponent(selectedRoom)}`)
      .then(data => { setRoomHistory(data.profile_history || []); setSelectedOwnerDetails(data); })
      .catch(err => console.error(err))
      .finally(() => setLoadingHistory(false));
  }, [selectedRoom]);

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredOwners = owners.filter(o => 
    (o.building_room && o.building_room.toLowerCase().includes(lowerSearchTerm)) || 
    (o.owner_name && o.owner_name.toLowerCase().includes(lowerSearchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden flex flex-col md:flex-row flex-1 min-h-[80vh] md:min-h-[600px] transition-all duration-500">
        
        <div className={`w-full md:w-1/3 border-b md:border-b-0 border-white/30 flex flex-col bg-white/10 shrink-0 transition-all relative z-0 ${selectedRoom ? 'hidden md:flex' : 'flex-1 md:h-auto'}`}>
          <div className="p-5 border-b border-white/20 bg-white/10">
            <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-3 mb-4"><div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#007AFF]"><Activity className="w-4 h-4" /></div> 按业主查看动态</h2>
            <div className="relative"><Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" /><input type="text" placeholder="搜索房号 / 姓名..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50" /></div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loadingOwners ? (<div className="text-center text-xs text-[#86868b] py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>加载业主列表...</div>) : filteredOwners.length > 0 ? (
              filteredOwners.map(owner => (
                <button key={owner.building_room} onClick={() => setSelectedRoom(owner.building_room)} className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between group ${selectedRoom === owner.building_room ? 'bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 text-[#007AFF] scale-[1.02] translate-x-2' : 'hover:bg-white/40 hover:translate-x-1 text-[#424245] border border-transparent'}`}>
                  <div><div className={`font-semibold text-sm ${selectedRoom === owner.building_room ? 'text-[#1d1d1f]' : ''}`}>{owner.building_room}</div><div className={`text-xs mt-0.5 ${selectedRoom === owner.building_room ? 'text-[#007AFF]' : 'text-[#86868b]'}`}>{owner.owner_name || '未知业主'}</div></div><ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoom === owner.building_room ? 'opacity-100 text-[#007AFF]' : 'text-[#86868b]'}`} />
                </button>
              ))
            ) : (<div className="text-center text-xs text-[#86868b] py-4">未找到匹配的业主</div>)}
          </div>
        </div>

        <div className={`w-full md:w-2/3 flex flex-col bg-gradient-to-br from-white/95 to-white/70 shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.15),-24px_0_48px_-16px_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,1)] relative z-10 flex-1 min-w-0 min-h-0 ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          {selectedRoom ? (
            <>
              <div className="p-5 border-b border-white/80 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2"><button onClick={() => setSelectedRoom(null)} className="md:hidden p-1.5 -ml-2 hover:bg-black/5 rounded-lg text-[#86868b] active:scale-95 transition-all"><ArrowRight className="w-5 h-5 rotate-180" /></button><h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">{selectedRoom} 的动态</h3></div>
                <div className="text-xs text-[#86868b] bg-[#F2F2F7] px-2.5 py-1 rounded-md font-medium">{roomHistory.length} 条记录</div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {loadingHistory ? (
                  <div className="text-center text-[#86868b] text-sm py-10 flex flex-col items-center"><Loader2 className="w-6 h-6 animate-spin mb-3 text-[#007AFF]"/>正在加载数据...</div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                    {selectedOwnerDetails && (
                      <div className="bg-white/40 backdrop-blur-3xl border border-white/80 p-5 sm:p-7 rounded-[2rem] mb-8 shadow-[0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] relative">
                        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none -z-10"><div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#007AFF]/10 to-purple-500/10 rounded-full blur-3xl" /></div>
                        
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/60">
                          <h4 className="text-base font-extrabold text-[#1d1d1f] flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#0051e3] flex items-center justify-center shadow-lg text-white"><User className="w-5 h-5" /></div>业主全维档案</h4>
                          <div className="text-xs font-bold text-[#007AFF] bg-white px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-blue-50/50">{selectedOwnerDetails.building_room}</div>
                        </div>

                        <div className="space-y-5">
                          {[
                            { title: "基础信息", icon: User, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200/50", keys: ['owner_name', 'phone', 'occupation', 'age', 'gender', 'political_status', 'wechat'] },
                            { title: "对接与财务", icon: DollarSign, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200/50", keys: ['contact_person', 'relationship', 'contact_phone', 'payer', 'payment_method', 'payment_cycle', 'payment_date'] },
                            { title: "房产与生活", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200/50", keys: ['area', 'delivery_standard', 'is_resident', 'pets'] },
                            { title: "车辆出行", icon: Car, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200/50", keys: ['car_plate', 'is_new_energy', 'use_charging_pile', 'ebike_count', 'tricycle_count', 'stroller_count'] },
                            { title: "社区互动", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200/50", keys: ['activity_frequency', 'activity_type'] },
                            { title: "画像特征", icon: Sparkles, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200/50", keys: ['customer_level', 'opinion_tags', 'negative_info'] }
                          ].map(group => (
                            <div key={group.title} className="bg-white/50 p-4 sm:p-5 rounded-[1.5rem] border border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:bg-white/70">
                               <div className="flex items-center gap-2.5 mb-4"><div className={`w-7 h-7 rounded-lg ${group.bg} flex items-center justify-center border ${group.border}`}><group.icon className={`w-4 h-4 ${group.color}`} /></div><h5 className="text-[13px] font-bold text-[#424245] uppercase tracking-wider">{group.title}</h5></div>
                               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                 {group.keys.map(key => {
                                    const val = selectedOwnerDetails[key];
                                    const displayVal = formatVal(val, key);
                                    const isEmpty = displayVal === '无' || displayVal === '0';
                                    const isNegative = key === 'negative_info';
                                    const isCustomerLevel = key === 'customer_level';
                                    const isExpanded = expandedField === key;
                                    
                                    let colSpanClass = 'col-span-1';
                                    if (isNegative) colSpanClass = 'col-span-2 sm:col-span-3 lg:col-span-4';
                                    else if (key === 'opinion_tags') colSpanClass = 'col-span-2 sm:col-span-2 lg:col-span-3';
                                    
                                    return (
                                        <div key={key} className={`relative ${colSpanClass}`}>
                                            <div onClick={() => setExpandedField(isExpanded ? null : key)} className={`flex flex-col bg-white/90 backdrop-blur-sm px-3.5 py-3 rounded-[1rem] border transition-all duration-300 cursor-pointer w-full h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 z-10 ${isNegative && val ? 'border-red-200 bg-red-50' : 'border-black/[0.03]'}`} title="点击展开完整信息">
                                                <span className={`text-[11px] font-bold mb-1.5 tracking-wide ${isNegative && val ? 'text-red-500' : 'text-[#86868b]'}`}>{fieldLabels[key]}</span>
                                                {isCustomerLevel ? ( <span className={`w-fit px-2.5 py-0.5 rounded-md text-[12px] font-bold shadow-sm ${val === 'S' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200/50' : val === 'A' ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200/50' : val === 'B' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/50' : 'bg-[#F2F2F7] text-[#424245] border border-black/5'}`}>{displayVal}</span>
                                                ) : ( <span className={`text-[13px] ${isNegative && val ? 'text-red-700 font-bold' : isEmpty ? 'text-[#86868b]/40 font-medium' : 'text-[#1d1d1f] font-semibold'} ${(isNegative || key === 'opinion_tags') ? 'line-clamp-2 leading-relaxed' : 'truncate'} block`}>{displayVal}</span> )}
                                            </div>
                                            <div onClick={() => setExpandedField(null)} className={`absolute top-0 left-0 w-[calc(100%+16px)] -translate-x-[8px] -translate-y-[8px] flex flex-col bg-white/95 backdrop-blur-3xl px-4 py-3.5 rounded-[1.2rem] border border-[#007AFF]/40 shadow-[0_32px_80px_rgba(0,122,255,0.25)] ring-4 ring-[#007AFF]/15 h-auto min-h-full z-[100] cursor-pointer transition-all duration-300 origin-top-left ${isExpanded ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-95 pointer-events-none invisible'}`} title="点击折叠">
                                               <span className={`text-[11px] font-bold mb-1.5 tracking-wide ${isNegative && val ? 'text-red-500' : 'text-[#007AFF]'}`}>{fieldLabels[key]}</span>
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
                      </div>
                    )}

                    <h4 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-[#007AFF]" />历史变更轨迹与字段记录</h4>
                    
                    {roomHistory.length > 0 ? (
                      <div className="relative border-l border-[#007AFF]/20 ml-4 space-y-8">
                    {roomHistory.map((hist, idx) => {
                      let snapshot = {}; let prevSnapshot = {};
                      try { snapshot = JSON.parse(hist.data_snapshot); } catch(e){}
                      try { if (roomHistory[idx + 1]) prevSnapshot = JSON.parse(roomHistory[idx + 1].data_snapshot); } catch(e){}

                      const changes = [];
                      Object.keys(fieldLabels).forEach(key => {
                        const oldVal = formatVal(prevSnapshot[key], key); const newVal = formatVal(snapshot[key], key);
                        if (oldVal !== newVal) changes.push({ key, label: fieldLabels[key], oldVal, newVal });
                      });
                      const isExpanded = expandedHistId === (hist.id || idx);

                      return (
                        <div key={hist.id || idx} className="relative pl-6 animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx * 50}ms`}}>
                          <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-[#007AFF] rounded-full shadow-sm"></div>
                          <div className="text-xs text-[#86868b] font-mono mb-2">{hist.created_at}</div>
                          <div onClick={() => setExpandedHistId(isExpanded ? null : (hist.id || idx))} className={`bg-white/60 backdrop-blur-2xl border p-5 rounded-[1.5rem] text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none ${isExpanded ? 'border-[#007AFF]/40 shadow-[0_20px_48px_rgba(0,122,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)] -translate-y-1.5 scale-[1.02] z-10 relative' : 'border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_40px_rgba(0,122,255,0.08)] hover:-translate-y-1'}`}>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-[#424245]"><span className="text-[#86868b] text-xs block mb-1">操作人</span> <span className="font-medium">{snapshot.updated_by || localStorage.getItem('butler_username') || '未知'}</span></div>
                              <div className="text-[#424245]"><span className="text-[#86868b] text-xs block mb-1">客户等级</span><span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${snapshot.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' : snapshot.customer_level === 'A' ? 'bg-red-100 text-red-800' : snapshot.customer_level === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-[#F2F2F7] text-[#1d1d1f]'}`}>{snapshot.customer_level || 'C'}</span></div>
                            </div>
                            <div className="text-[#424245] mb-3"><span className="text-[#86868b] text-xs block mb-1">舆论标签</span> {snapshot.opinion_tags || '-'}</div>
                            <div className="text-red-600 bg-red-50/50 p-3 rounded-xl border border-red-100/50"><span className="text-red-500 text-xs block mb-1 font-medium">负向/敏感信息</span> {snapshot.negative_info || '-'}</div>
                            <div className="mt-3 flex flex-col items-center justify-center text-[#86868b]/50 hover:text-[#007AFF] transition-colors gap-1">{!isExpanded && <span className="text-[10px] font-medium tracking-wide">点击查看变更字段</span>}<div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#007AFF]' : ''}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></div></div>
                            {isExpanded && (
                               <div className="mt-2 pt-4 border-t border-black/5 animate-in slide-in-from-top-2 duration-300">
                                  <h5 className="text-xs font-bold text-[#424245] mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> 变更字段对比</h5>
                                  {changes.length > 0 ? (<div className="space-y-2">{changes.map(c => (<div key={c.key} className="flex items-center text-xs bg-black/[0.03] px-3 py-2.5 rounded-xl"><span className="w-20 text-[#86868b] font-medium shrink-0">{c.label}</span><span className="text-red-500/70 line-through truncate flex-1 min-w-0 text-right" title={c.oldVal}>{c.oldVal}</span><ArrowRight className="w-3.5 h-3.5 text-[#86868b]/40 mx-3 shrink-0" /><span className="text-green-600 font-medium truncate flex-1 min-w-0" title={c.newVal}>{c.newVal}</span></div>))}</div>) : (<div className="text-xs text-[#86868b] bg-black/[0.02] p-3 rounded-xl text-center">没有检测到数据字段的实质性修改。</div>)}
                               </div>
                             )}
                          </div>
                        </div>
                      )
                    })}
                      </div>
                    ) : (<div className="text-center text-sm text-[#86868b] bg-white/50 py-10 rounded-2xl border border-black/5 border-dashed">该业主暂无历史变动记录</div>)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] p-6"><div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/80"><Activity className="w-8 h-8 text-[#007AFF]/60" /></div><p className="font-medium text-[#424245] text-base">请在左侧选择一个业主</p><p className="text-sm mt-2">查看其专属的动态变更轨迹</p></div>
          )}
        </div>
      </div>
    </div>
  );
}