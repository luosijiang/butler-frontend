import React, { useState } from 'react';
import { Sparkles, User, Lock, Loader2, ArrowRight } from 'lucide-react';
import request from '../utils/request';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await request.post('/api/login', { username, password });
      
      if (data.token) {
        onLogin(data.token, data.username);
      } else {
        throw new Error('登录凭证无效');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('用户名或密码错误');
      } else {
        setError(err.response?.data?.detail || err.message || '登录失败，请检查网络或联系管理员');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-400/50 to-indigo-400/40 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-1" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-teal-400/40 to-blue-500/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-2" />
      <div className="bg-white/40 backdrop-blur-[60px] p-10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.15),inset_0_2px_6px_rgba(255,255,255,0.8)] max-w-sm w-full border border-white/70 relative z-10 flex flex-col min-h-0 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Butler AI</h1>
          <p className="text-[#86868b] text-sm mt-1">智能管家系统</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 ml-1">用户名</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-[#86868b]" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="请输入用户名" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 ml-1">访问密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#86868b]" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="请输入密码" />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#007AFF] text-white font-medium py-3.5 rounded-full hover:bg-[#0071e3] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? '正在登录...' : '进入系统'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}