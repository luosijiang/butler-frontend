import React, { useState } from 'react';
import { Wrench, X, Loader2 } from 'lucide-react';
import request from '../utils/request';

export default function RepairEditModal({ record, onClose, onSuccess }) {
  const [status, setStatus] = useState(record.status || '处理中');
  const [handler, setHandler] = useState(record.handler || '');
  const [processDetail, setProcessDetail] = useState(record.process_detail || '');
  const [callbackResult, setCallbackResult] = useState(record.callback_result || '');
  const [completionRecord, setCompletionRecord] = useState(record.completion_record || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await request.put(`/api/repair_records/${record.id}`, {
        status,
        handler: handler || undefined,
        process_detail: processDetail || undefined,
        callback_result: callbackResult || undefined,
        completion_record: completionRecord || undefined
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || '更新失败');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
      <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40">
          <h3 className="font-semibold text-lg text-[#1d1d1f] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" /> 更新报修记录
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
            {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
            
            <div className="bg-[#F2F2F7] p-3 rounded-xl mb-4 text-sm flex flex-col gap-2 text-[#1d1d1f]">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <div><span className="text-[#86868b] mr-1">房号:</span><span className="font-medium">{record.building_room}</span></div>
                {record.owner_name && <div><span className="text-[#86868b] mr-1">业主:</span><span className="font-medium">{record.owner_name}</span></div>}
                {record.phone && <div><span className="text-[#86868b] mr-1">电话:</span><span className="font-medium">{record.phone}</span></div>}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <div><span className="text-[#86868b] mr-1">项目:</span><span className="font-medium">{record.item}</span></div>
                <div><span className="text-[#86868b] mr-1">录入人:</span><span className="font-medium">{record.operator || localStorage.getItem('butler_username') || '未知'}</span></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">最新状态</label>
              <select value={status} onChange={e => setStatus(e.target.value)} disabled={record.status === '已完成'} className={`w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${record.status === '已完成' ? 'opacity-60 cursor-not-allowed bg-black/5' : ''}`}>
                <option value="处理中">处理中</option><option value="已完成">已完成</option>
              </select>
            </div>
            <div><label className="block text-sm font-semibold text-[#424245] mb-2">接单人 (维修人)</label><input type="text" value={handler} onChange={e => setHandler(e.target.value)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="输入负责维修此工单的接单人姓名..." /></div>
            <div><label className="block text-sm font-semibold text-[#424245] mb-2">补充处理详情</label><textarea value={processDetail} onChange={e => setProcessDetail(e.target.value)} rows="3" className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="输入最新的处理进展..." /></div>
            <div><label className="block text-sm font-semibold text-[#424245] mb-2">完成记录</label><textarea value={completionRecord} onChange={e => setCompletionRecord(e.target.value)} rows="2" className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="如已完成，请输入完成详情..." /></div>
            <div><label className="block text-sm font-semibold text-[#424245] mb-2">回访结果</label><textarea value={callbackResult} onChange={e => setCallbackResult(e.target.value)} rows="2" className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="输入回访记录..." /></div>
          </div>
          <div className="p-5 bg-white/40 flex justify-end gap-3 border-t border-white/50 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-[#1d1d1f] rounded-xl font-medium hover:bg-black/5 transition-colors">取消</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}