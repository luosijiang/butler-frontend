import React, { useState, useEffect } from 'react';
import { Search, FileText, Loader2, AlertTriangle, User, ArrowRight } from 'lucide-react';
import request from '../utils/request';

export default function AdminPage({ onViewRecord }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    request.get('/api/records/list')
      .then(data => { 
        setRecords(Array.isArray(data.records) ? data.records : []); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error(err); 
        setLoading(false); 
      });
  }, []);

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredRecords = records.filter(r => 
    (r.building_room && r.building_room.toLowerCase().includes(lowerSearchTerm)) ||
    (r.owner_name && r.owner_name.toLowerCase().includes(lowerSearchTerm)) ||
    (r.phone && r.phone.toLowerCase().includes(lowerSearchTerm)) ||
    (r.opinion_tags && r.opinion_tags.toLowerCase().includes(lowerSearchTerm)) ||
    (r.updated_by && r.updated_by.toLowerCase().includes(lowerSearchTerm))
  );

  // --- 新增：按楼栋分组逻辑 ---
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    // 假设房号格式为 A-101, B-102 等
    const building = record.building_room?.split('-')[0]?.toUpperCase() || '其他';
    if (!acc[building]) acc[building] = [];
    acc[building].push(record);
    return acc;
  }, {});

  // 获取排序后的组名 (A, B, C, D...)
  const sortedGroups = Object.keys(groupedRecords).sort();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden transition-all duration-500">
        <div className="p-5 sm:p-6 border-b border-white/50 bg-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F2F2F7] rounded-xl flex items-center justify-center text-[#1d1d1f]"><FileText className="w-5 h-5" /></div> 业主档案总览
            </h2>
            <div className="text-xs font-medium text-[#86868b] bg-[#F2F2F7] px-3 py-1 rounded-full">共 {filteredRecords.length} 条记录</div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" />
            <input type="text" placeholder="检索房号/姓名/电话/标签/操作人..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/50 border border-white/60 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all" />
          </div>
        </div>
        
        <div className="overflow-y-auto overflow-x-hidden">
          <table className="hidden md:table w-full text-sm text-left table-fixed">
            <thead className="bg-white/40 text-[#86868b] font-medium border-b border-white/50 backdrop-blur-md">
              <tr>
                <th className="p-4 pl-6 text-center w-16">序号</th><th className="p-4 w-[20%]">房产信息</th><th className="p-4 w-[20%]">业主联系</th><th className="p-4 w-[25%]">画像特征</th><th className="p-4 w-[20%]">系统更新</th><th className="p-4 w-20 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-[#86868b]"><Loader2 className="w-5 h-5 animate-spin inline mr-2"/>正在读取数据库...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-[#86868b]">未找到匹配的档案记录</td></tr>
              ) : (
                sortedGroups.map(group => (
                  <React.Fragment key={group}>
                    {/* 分组标题行 */}
                    <tr className="bg-[#F2F2F7]/50">
                      <td colSpan="6" className="px-6 py-2 text-[11px] font-bold text-[#86868b] tracking-wider uppercase">
                        {group} 栋业主档案 ({groupedRecords[group].length})
                      </td>
                    </tr>
                    {groupedRecords[group].map((record, index) => (
                      <tr key={record.building_room + index} className="hover:bg-white/50 transition-colors group cursor-pointer" onClick={() => onViewRecord(record)}>
                        <td className="p-4 pl-6 text-center font-mono text-xs text-[#86868b]">#{index + 1}</td>
                        <td className="p-4 truncate">
                          <div className="font-semibold text-[#1d1d1f] truncate">{record.building_room}</div>
                          <div className="text-[11px] text-[#86868b] mt-0.5 truncate">{record.area ? `${record.area}㎡` : '面积未知'} · {record.is_resident ? '常住' : '非常住'}</div>
                        </td>
                        <td className="p-4 truncate">
                          <div className="font-medium text-[#424245] flex items-center gap-1 truncate">
                            <span className="truncate">{record.owner_name || '未知业主'}</span>
                            {record.negative_info && <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 shrink-0" title={`敏感信息: ${record.negative_info}`} />}
                          </div>
                          <div className="text-[11px] text-[#86868b] mt-0.5 font-mono truncate">{record.phone || '无电话'}</div>
                        </td>
                        <td className="p-4 truncate">
                          <div className="flex items-center gap-2 mb-1 truncate">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${record.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' : record.customer_level === 'A' ? 'bg-red-100 text-red-800' : record.customer_level === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-[#F2F2F7] text-[#1d1d1f]'}`}>{record.customer_level || 'C'}</span>
                          </div>
                          <div className="text-[11px] text-[#424245] truncate" title={record.opinion_tags}>{record.opinion_tags || '暂无标签'}</div>
                        </td>
                        <td className="p-4 truncate">
                          <div className="text-xs text-[#424245] mb-0.5 truncate">{record.updated_by || localStorage.getItem('butler_username') || '未知'}</div>
                          <div className="text-[10px] text-[#86868b] font-mono truncate">{new Date(record.updated_at).toLocaleString('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="p-4 text-center">
                          <button className="text-[#007AFF] bg-[#007AFF]/5 hover:bg-[#007AFF]/15 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium" onClick={(e) => { e.stopPropagation(); onViewRecord(record); }}>详情</button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          <div className="md:hidden p-4 space-y-6">
            {loading ? (
              <div className="py-8 text-center text-[#86868b]"><Loader2 className="w-5 h-5 animate-spin inline mr-2"/>正在读取...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-8 text-center text-[#86868b]">未找到匹配的档案记录</div>
            ) : (
              sortedGroups.map(group => (
                <div key={group + "-mobile"} className="space-y-4">
                  <div className="px-2 text-[11px] font-bold text-[#86868b] tracking-wider uppercase border-l-2 border-[#007AFF] pl-2 mb-2">
                    {group} 栋业主 ({groupedRecords[group].length})
                  </div>
                  {groupedRecords[group].map((record, index) => (
                    <div key={record.building_room + index} className="bg-white/80 p-4 rounded-2xl shadow-sm border border-white/60 relative cursor-pointer active:scale-[0.98] transition-all" onClick={() => onViewRecord(record)}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-[#1d1d1f] text-base">{record.building_room}</div>
                          <div className="text-xs text-[#86868b] mt-0.5">{record.area ? `${record.area}㎡` : '面积未知'} · {record.is_resident ? '常住' : '非常住'}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${record.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' : record.customer_level === 'A' ? 'bg-red-100 text-red-800' : record.customer_level === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-[#F2F2F7] text-[#1d1d1f]'}`}>{record.customer_level || 'C'}</span>
                      </div>
                      
                      <div className="bg-black/[0.03] p-3 rounded-xl space-y-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-[#424245]">
                          <User className="w-4 h-4 text-[#86868b]" />
                          <span className="font-medium">{record.owner_name || '未知业主'}</span>
                          <span className="text-xs font-mono opacity-80">{record.phone || '无电话'}</span>
                          {record.negative_info && <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 ml-auto" />}
                        </div>
                        <div className="flex items-start gap-2 text-[#424245]">
                          <FileText className="w-4 h-4 text-[#86868b] shrink-0 mt-0.5" />
                          <span className="text-xs line-clamp-2 leading-relaxed">{record.opinion_tags || '暂无舆论标签'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                         <div className="flex items-center gap-1.5">更新人: {record.updated_by || localStorage.getItem('butler_username') || '未知'}</div>
                         <div className="text-[#007AFF] bg-[#007AFF]/10 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">查看详情 <ArrowRight className="w-3 h-3" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}