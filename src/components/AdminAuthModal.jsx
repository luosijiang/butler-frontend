import React, { useState } from 'react';
import { Shield, X, Lock, Loader2 } from 'lucide-react';
import request from '../utils/request';

export default function AdminAuthModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await request.post('/api/verify-admin-password', { password });
      onSuccess();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('管理员密码错误');
      } else {
        setError(err.response?.data?.detail || err.message || '验证失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
      <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40">
          <h3 className="font-semibold text-lg text-[#1d1d1f] flex items-center gap-2"><Shield className="w-5 h-5 text-[#86868b]"/> 管理员验证</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#424245]">访问后台记录需要输入管理员密码进行二次验证。</p>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 ml-1">管理员密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#86868b]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="请输入管理员密码" autoFocus />
              </div>
            </div>
            {error && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
          </div>
          <div className="p-5 bg-white/40 flex justify-end gap-2 border-t border-white/50">
            <button type="button" onClick={onClose} className="px-5 py-2 text-[#1d1d1f] rounded-full font-medium hover:bg-black/5 transition-colors">取消</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-[#007AFF] text-white rounded-full font-medium hover:bg-[#0071e3] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} {isLoading ? '验证中...' : '确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}