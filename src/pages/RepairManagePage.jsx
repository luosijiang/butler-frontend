import React, { useState, useEffect } from 'react';
import { Wrench, Search, Loader2, ArrowRight, Edit, CheckCircle, AlertTriangle } from 'lucide-react';
import RepairEditModal from '../components/RepairEditModal';
import { sortRoomsByNumber, calculateDuration } from '../utils/helpers';
import request from '../utils/request';

export default function RepairManagePage({ onUpdate, initialRoom }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [toast, setToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(initialRoom || null);

  useEffect(() => { setSelectedRoom(initialRoom || null); }, [initialRoom]);

  const fetchRecords = async () => {
    try {
      const data = await request.get('/api/repair_records/list');
      setRecords(data.records || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const groupedRecords = records.reduce((acc, curr) => {
    const roomName = curr.building_room || '未知房号';
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(curr);
    return acc;
  }, {});

  const roomList = Object.keys(groupedRecords).map(room => ({
    room, owner_name: groupedRecords[room][0].owner_name || '未知业主', count: groupedRecords[room].length
  })).sort((a, b) => sortRoomsByNumber(a.room, b.room));

  const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredRooms = roomList.filter(r => {
    if (searchTerms.length === 0) return true;
    return searchTerms.every(term => {
      const matchRoom = r.room && r.room.toLowerCase().includes(term);
      const matchOwner = r.owner_name && r.owner_name.toLowerCase().includes(term);
      const matchRecords = groupedRecords[r.room].some(record => 
        (record.report_time && record.report_time.toLowerCase().includes(term)) ||
        (record.item && record.item.toLowerCase().includes(term))
      );
      return matchRoom || matchOwner || matchRecords;
    });
  });

  const displayedRecords = selectedRoom ? (groupedRecords[selectedRoom] || []).filter(record => {
    if (searchTerms.length === 0) return true;
    const roomStr = selectedRoom.toLowerCase();
    const ownerStr = (groupedRecords[selectedRoom][0]?.owner_name || '').toLowerCase();
    return searchTerms.every(term => {
      const matchRoomOrOwner = roomStr.includes(term) || ownerStr.includes(term);
      const matchRecord = (record.report_time && record.report_time.toLowerCase().includes(term)) ||
                          (record.item && record.item.toLowerCase().includes(term));
      return matchRoomOrOwner || matchRecord;
    });
  }) : [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden flex flex-col md:flex-row flex-1 min-h-[80vh] md:min-h-[600px] transition-all duration-500">
        
        <div className={`w-full md:w-1/3 border-b md:border-b-0 border-white/30 flex flex-col bg-white/10 shrink-0 transition-all relative z-0 ${selectedRoom ? 'hidden md:flex' : 'flex-1 md:h-auto'}`}>
          <div className="p-5 border-b border-white/20 bg-white/10">
            <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600"><Wrench className="w-4 h-4" /></div> 按业主查看工单
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" />
              <input type="text" placeholder="搜索 例如: A-101 03-21..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? ( <div className="text-center text-xs text-[#86868b] py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>加载业主列表...</div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map(r => (
                <button key={r.room} onClick={() => setSelectedRoom(r.room)} className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between group ${selectedRoom === r.room ? 'bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 text-[#007AFF] scale-[1.02] translate-x-2' : 'hover:bg-white/40 hover:translate-x-1 text-[#424245] border border-transparent'}`}>
                  <div><div className={`font-semibold text-sm ${selectedRoom === r.room ? 'text-[#1d1d1f]' : ''}`}>{r.room}</div><div className={`text-xs mt-0.5 ${selectedRoom === r.room ? 'text-[#007AFF]' : 'text-[#86868b]'}`}>{r.owner_name} <span className="ml-1 opacity-60">({r.count} 工单)</span></div></div>
                  <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoom === r.room ? 'opacity-100 text-[#007AFF]' : 'text-[#86868b]'}`} />
                </button>
              ))
            ) : (<div className="text-center text-xs text-[#86868b] py-4">未找到匹配的业主</div>)}
          </div>
        </div>

        <div className={`w-full md:w-2/3 flex flex-col bg-gradient-to-br from-white/95 to-white/70 shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.15),-24px_0_48px_-16px_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,1)] relative z-10 flex-1 min-w-0 min-h-0 ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          {selectedRoom ? (
            <>
              <div className="p-5 border-b border-white/80 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2"><button onClick={() => setSelectedRoom(null)} className="md:hidden p-1.5 -ml-2 hover:bg-black/5 rounded-lg text-[#86868b] active:scale-95 transition-all"><ArrowRight className="w-5 h-5 rotate-180" /></button><h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">{selectedRoom} 的报修工单</h3></div>
                <div className="text-xs text-[#86868b] bg-[#F2F2F7] px-2.5 py-1 rounded-md font-medium">{displayedRecords.length} 项记录</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4">
                  {displayedRecords.map((record) => (
                    <div key={record.id} className={`p-5 rounded-[1.5rem] border shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,122,255,0.08)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${record.status === '已完成' ? 'bg-white/30 backdrop-blur-md border-white/40 opacity-90' : 'bg-white/60 backdrop-blur-xl border-white/80'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-sm text-[#86868b] font-medium">#{record.id}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${record.status === '已完成' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{record.status}</span>
                      </div>
                      <div className="font-semibold text-[#1d1d1f] text-base mb-4">{record.item}</div>
                      <div className="space-y-2 text-sm text-[#86868b] bg-black/[0.02] p-3.5 rounded-xl mb-4 border border-black/5 flex-1">
                        <div className="flex items-center gap-2"><span className="font-medium text-[#424245]">报事:</span> {record.report_time.replace('T', ' ')}</div>
                        {record.completion_time && (
                          <div className="text-green-600 flex items-center gap-2 flex-wrap">
                            <span><span className="font-medium text-green-700">完成:</span> {record.completion_time.replace('T', ' ')}</span>
                            <span className="bg-green-100/80 text-green-700 px-1.5 py-[1px] rounded text-xs font-medium">历时 {calculateDuration(record.report_time, record.completion_time)}</span>
                          </div>
                        )}
                        <div className="border-t border-black/5 my-2 pt-2 flex items-center gap-4 flex-wrap">
                           <div><span className="font-medium text-[#424245]">录入人:</span> {record.operator || localStorage.getItem('butler_username') || '未知'}</div>
                           <div><span className="font-medium text-[#007AFF]">接单人:</span> {record.handler || '-'}</div>
                        </div>
                        {record.process_detail && <div className="text-[#424245] line-clamp-3 leading-relaxed"><span className="font-medium">详情:</span> {record.process_detail}</div>}
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => setEditingRecord(record)} className="px-4 py-2.5 text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-xl transition-colors flex items-center justify-center text-sm font-semibold active:scale-95 shadow-sm" title="编辑工单详情"><Edit className="w-4 h-4 mr-2" /> 处理 / 编辑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] p-6">
              <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/80"><Wrench className="w-8 h-8 text-orange-400" /></div>
              <p className="font-medium text-[#424245] text-base">请在左侧选择一个业主</p>
              <p className="text-sm mt-2">查看其专属的报修工单记录</p>
            </div>
          )}
        </div>
      </div>

      {editingRecord && (
        <RepairEditModal record={editingRecord} onClose={() => setEditingRecord(null)} onSuccess={() => { setEditingRecord(null); fetchRecords(); if(onUpdate) onUpdate(); setToast('工单记录已成功更新'); setTimeout(() => setToast(''), 3000); }} />
      )}

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-xl text-green-700 px-6 py-3 rounded-2xl shadow-[0_12px_40px_rgba(52,199,89,0.25)] border border-green-200 flex items-center gap-3 animate-in fade-in zoom-in-95 slide-in-from-top-6 duration-500">
           <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-green-600" /></div><span className="font-semibold text-sm tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
}